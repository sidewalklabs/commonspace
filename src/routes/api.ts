import camelcaseKeys from 'camelcase-keys';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import moment from 'moment';
import { parse as json2csv } from 'json2csv';
import passport from 'passport';
import { NOT_NULL_VIOLATION, UNIQUE_VIOLATION } from 'pg-error-constants';
import uuid from 'uuid';

import { deleteLocation } from '../datastore/location';
import { return500OnError } from './utils';

import {
    updateDataPointForSurveyNoStudyId,
    deleteDataPoint,
    getDataPointsForSurvey,
    getDataPointsForStudy,
    getDataPointsCSV,
    addNewDataPointToSurveyNoStudyId
} from '../datastore/datapoint';
import { StudyField, IdAlreadyExists, IdDoesNotExist } from '../datastore/utils';
import {
    createStudy,
    deleteStudy,
    removeUserFromAllSurveys,
    giveUserStudyAccess,
    returnStudiesForAdmin,
    returnStudiesUserIsAssignedTo,
    allSurveysForStudy,
    StudyType,
    updateStudy,
    deleteStudiesForUserId,
    userIdIsAdminOfStudy,
    usersSurveysForStudy,
    returnStudyMetadata,
    getSurveyorsForStudy,
    deleteSurveyorFromStudy
} from '../datastore/study';
import { userIdIsSurveyor, createNewSurveyForStudy, updateSurvey } from '../datastore/survey';
import { userIsAdminOfStudy, deleteUser } from '../datastore/user';
import { createLocation } from '../datastore/location';
import DbPool from '../database';
import { Feature, FeatureCollection, Point } from 'geojson';
import { snakecasePayload } from '../utils';
import { emailIsVerified, tokenIsBlacklisted } from '../auth';
import {
    return404OnIdDoesNotExist,
    return401OnUnauthorizedError,
    UnauthorizedError
} from './errors';

import { DataPoint, Study, Survey } from './api_types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse?format=json';

const STUDY_FIELDS: StudyField[] = [
    'gender',
    'age',
    'mode',
    'posture',
    'activities',
    'groups',
    'object',
    'location',
    'notes'
];

async function checkAgainstTokenBlacklist(req: Request, res: Response, next) {
    if (await tokenIsBlacklisted(DbPool, req)) {
        const errorMessage = 'token invalid';
        res.clearCookie('commonspacejwt');
        res.statusMessage = errorMessage;
        res.status(401).send({ error_message: errorMessage });
        return;
    }
    next();
}

const router = express.Router();

router.use(cookieParser());

router.use(passport.authenticate('jwt', { session: false }));

router.use(checkAgainstTokenBlacklist);

router.delete(
    '/user',
    return500OnError(async (req: Request, res: Response) => {
        const { user_id: userId } = req.user;
        await removeUserFromAllSurveys(DbPool, userId);
        await deleteStudiesForUserId(DbPool, userId);
        await deleteUser(DbPool, userId);
        res.status(200).send();
    })
);

router.get(
    '/user/is_verified',
    return500OnError(
        return401OnUnauthorizedError(async function(req, res) {
            const { user_id: userId } = req.user;
            const isVerified = await emailIsVerified(DbPool, userId);
            if (isVerified) {
                res.status(200).send();
                return;
            } else {
                throw new UnauthorizedError(req.route, userId);
            }
        })
    )
);

router.get(
    '/studies',
    return500OnError(
        async (req: Request, res: Response): Promise<Study[]> => {
            const { type = 'all' } = req.query;
            const { user_id: userId } = req.user;
            let responseBody: Study[] = [];
            if (type === 'admin') {
                responseBody = await returnStudiesForAdmin(DbPool, userId);
            } else if (type === 'surveyor') {
                responseBody = (await returnStudiesUserIsAssignedTo(DbPool, userId)) as Study[];
            } else if (type === 'all') {
                const adminStudies = (await returnStudiesForAdmin(DbPool, userId)) as Study[];
                const suveyorStudies = (await returnStudiesUserIsAssignedTo(
                    DbPool,
                    userId
                )) as Study[];
                responseBody = adminStudies.concat(suveyorStudies);
            } else {
                const errorMessage = 'query param must be all|admin|surveyor';
                res.statusMessage = errorMessage;
                res.status(400).send({ error_message: errorMessage });
                return;
            }
            res.send(responseBody);
        }
    )
);

router.get(
    '/studies/download',
    return500OnError(async (req: Request, res: Response) => {
        const { user_id: userId } = req.user;
        const studies: Study[] = await returnStudiesForAdmin(DbPool, userId);
        const studiesWithDataPoints = await Promise.all(
            studies.map(async study => {
                const surveyIdToSurvey = await Promise.all(
                    study.surveys.map(async survey => {
                        const data_points = await getDataPointsForSurvey(DbPool, survey.survey_id);
                        const surveyObject = {
                            ...survey,
                            data_points
                        };
                        const res = {};
                        res[survey.survey_id] = surveyObject;
                        return res;
                    })
                );
                const idToSurvey = Object.assign({}, ...surveyIdToSurvey);
                study.surveys = study.surveys.map(s => {
                    const { survey_id: surveyId } = s;
                    const survey = idToSurvey[surveyId]
                        ? idToSurvey[surveyId]
                        : { ...s, data_points: [] };
                    return survey;
                });
                return { ...study };
            })
        );
        res.send(studiesWithDataPoints);
    })
);

async function saveStudyForUser(userId: string, inputStudy: Study) {
    const {
        protocol_version: protocolVersion,
        study_id: studyId,
        title,
        author,
        author_url: authorUrl,
        location,
        type,
        status = 'active',
        surveyors,
        surveys = [],
        map,
        fields,
        description
    } = inputStudy;
    const { lastUpdated, createdAt } = await createStudy(DbPool, {
        studyId,
        title,
        author,
        authorUrl,
        protocolVersion,
        userId,
        type,
        status,
        map,
        location,
        fields,
        description
    });
    const newUserIds = await Promise.all(
        surveyors.map(async email => {
            const [_, newUserId] = await giveUserStudyAccess(DbPool, email, studyId);
            return newUserId;
        })
    );
    if (map) {
        const surveyZoneIds = await Promise.all(map.features.map(saveGeoJsonFeatureAsLocation));
    }
    await Promise.all(
        surveys.map(async survey => {
            return createNewSurveyForStudy(
                DbPool,
                camelcaseKeys({
                    studyId,
                    ...survey,
                    userEmail: survey.email
                })
            );
        })
    );
    return { lastUpdated, createdAt };
}

router.post(
    '/studies',
    return500OnError(async (req: Request, res: Response) => {
        const { user_id: userId } = req.user;
        try {
            if (Array.isArray(req.body)) {
                const datetimes = await Promise.all(
                    req.body.map(async (s: Study) => {
                        const {
                            createdAt: created_at,
                            lastUpdated: last_updated
                        } = await saveStudyForUser(userId, s as Study);
                        return { ...s, created_at, last_updated };
                    })
                );
                res.send(datetimes);
            } else {
                const { createdAt: created_at, lastUpdated: last_updated } = await saveStudyForUser(
                    userId,
                    req.body as Study
                );
                res.send({ ...(req.body as Study), created_at, last_updated });
            }
        } catch (error) {
            if (error instanceof IdAlreadyExists) {
                res.statusMessage = error.message;
                res.status(409).send({ error_message: error.message });
                return;
            }
        }
    })
);

router.get(
    '/studies/:studyId',
    return500OnError(
        return404OnIdDoesNotExist(
            return401OnUnauthorizedError(async (req: Request, res: Response) => {
                const { user_id: userId } = req.user;
                const { studyId } = req.params;
                if (!userIsAdminOfStudy(DbPool, studyId, userId)) {
                    throw new UnauthorizedError(req.route, userId);
                    return;
                }
                const studyMetadata = await returnStudyMetadata(DbPool, studyId);
                const {
                    studyId: study_id,
                    authorUrl: author_url,
                    protocolVersion: protocol_version,
                    title,
                    author,
                    type,
                    status,
                    fields,
                    location,
                    map,
                    description,
                    surveyors
                } = studyMetadata;
                const study: Study = {
                    study_id,
                    author_url,
                    protocol_version,
                    title,
                    author,
                    type,
                    status,
                    fields,
                    location,
                    map,
                    description,
                    surveyors
                };
                res.status(200).send(study);
            })
        )
    )
);

router.delete(
    '/studies/:studyId',
    return500OnError(
        return401OnUnauthorizedError(async (req: Request, res: Response) => {
            const { user_id: userId } = req.user;
            const { studyId } = req.params;
            if (!(await userIdIsAdminOfStudy(DbPool, studyId, userId))) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            await deleteStudy(DbPool, studyId);
            res.status(200).send();
        })
    )
);

router.get(
    '/studies/:studyId/download',
    return500OnError(
        return401OnUnauthorizedError(async (req: Request, res: Response) => {
            if (req.headers['accept'] && req.headers['accept'] === 'text/csv') {
                const { user_id: userId } = req.user;
                const { studyId } = req.params;
                if (!(await userIdIsAdminOfStudy(DbPool, studyId, userId))) {
                    throw new UnauthorizedError(req.route, userId);
                    return;
                }
                const dataPoints = await getDataPointsCSV(DbPool, userId, studyId);
                const csv = json2csv(dataPoints);
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csv);
            }
        })
    )
);

router.get(
    '/studies/:studyId/datapoints',
    return500OnError(
        return401OnUnauthorizedError(async (req: Request, res: Response) => {
            const { user_id: userId } = req.user;
            const { studyId } = req.params;
            if (!(await userIdIsAdminOfStudy(DbPool, studyId, userId))) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            const dataPoints = await getDataPointsForStudy(DbPool, userId, studyId);
            res.status(200).send(dataPoints);
        })
    )
);

async function saveGeoJsonFeatureAsLocation(x: Feature | FeatureCollection) {
    if (x.type === 'Feature' && x.geometry.type === 'Polygon') {
        const { geometry, properties } = x;
        const { location_id: locationId, name: namePrimary } = properties;
        const { coordinates } = geometry;
        const [lngs, lats] = geometry.coordinates[0].reduce(
            ([lngs, lats], [lng, lat]) => {
                return [lngs + lng, lats + lat];
            },
            [0, 0]
        );
        const lngCenterApprox = lngs / geometry.coordinates[0].length;
        const latCenterApprox = lats / geometry.coordinates[0].length;
        const url = NOMINATIM_BASE_URL + `&lat=${latCenterApprox}&lon=${lngCenterApprox}`;
        //const response = await fetch(url);
        //const body = await response.json();
        const city = '';
        const country = '';
        const subdivision = '';
        return createLocation(DbPool, {
            locationId,
            namePrimary,
            city,
            country,
            subdivision,
            geometry
        });
    }
}

async function saveDataPoint(req: Request, res: Response) {
    const { user_id: userId } = req.user;
    const { surveyId, dataPointId } = req.params;

    const dataPointFromBody = req.body as DataPoint;
    if (dataPointFromBody.data_point_id && dataPointFromBody.data_point_id !== dataPointId) {
        const errorMessage = 'data_point_id in url must match that in body';
        res.statusMessage = errorMessage;
        res.status(400).send({ error_message: errorMessage });
        return;
    }

    await updateDataPointForSurveyNoStudyId(DbPool, surveyId, {
        ...dataPointFromBody,
        data_point_id: dataPointId
    });
    res.status(200).send();
}

router.get(
    '/surveys/:surveyId/datapoints',
    return500OnError(
        return401OnUnauthorizedError(async (req: Request, res: Response) => {
            const { user_id: userId } = req.user;
            const { surveyId } = req.params;
            const userCanAccessSurvey = await userIdIsSurveyor(DbPool, userId, surveyId);
            if (!userCanAccessSurvey) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            const databaseDataPoints = await getDataPointsForSurvey(DbPool, surveyId);
            res.send(databaseDataPoints);
        })
    )
);

router.post(
    '/surveys/:surveyId/datapoints',
    return500OnError(
        return401OnUnauthorizedError(async (req: Request, res: Response) => {
            const { user_id: userId } = req.user;
            const { surveyId } = req.params;
            const userCanAccessSurvey = await userIdIsSurveyor(DbPool, userId, surveyId);
            if (!userCanAccessSurvey) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            const datapoint = req.body;
            if (datapoint.creation_date && !datapoint.last_updated) {
                datapoint.last_updated = datapoint.creation_date;
            } else {
                datapoint.date = datapoint.date ? datapoint.date : moment().toISOString();
                datapoint.creation_date = datapoint.creation_date
                    ? datapoint.creation_date
                    : datapoint.date;
                datapoint.last_updated = datapoint.last_updated
                    ? datapoint.last_updated
                    : datapoint.date;
            }
            await addNewDataPointToSurveyNoStudyId(DbPool, surveyId, datapoint);
            res.status(200).send();
        })
    )
);

router.put(
    '/surveys/:surveyId/datapoints/:dataPointId',
    return500OnError(
        return401OnUnauthorizedError(async (req: Request, res: Response) => {
            const { user_id: userId } = req.user;
            const { surveyId } = req.params;
            if (!(await userIdIsSurveyor(DbPool, userId, surveyId))) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            const datapoint = req.body;
            datapoint.date = datapoint.date ? datapoint.date : moment().toISOString();
            datapoint.last_updated = datapoint.last_updated
                ? datapoint.last_updated
                : datapoint.date;
            await saveDataPoint(req, res);
            res.status(200).send(datapoint);
        })
    )
);

router.delete(
    '/surveys/:surveyId/datapoints/:dataPointId',
    return500OnError(async (req: Request, res: Response) => {
        const { user_id: userId } = req.user;
        const { surveyId, dataPointId } = req.params;
        if (!(await userIdIsSurveyor(DbPool, userId, surveyId))) {
            throw new UnauthorizedError(req.route, userId);
            return;
        }
        await deleteDataPoint(DbPool, surveyId, dataPointId);
        res.status(200).send();
    })
);

function convertDatabaseSurveyToRestSurvey(survey): Survey {
    const {
        user_id,
        survey_id,
        title,
        time_start,
        time_stop,
        location_id,
        email,
        representation,
        microclimate,
        temperature_celsius,
        method,
        notes
    } = survey;
    return {
        survey_id,
        title,
        location_id,
        start_date: time_start,
        end_date: time_stop,
        email: email,
        representation,
        microclimate,
        temperature_celsius,
        method,
        notes
    };
}

router.get(
    '/studies/:studyId/surveys',
    return500OnError(async (req, res) => {
        const { user_id: userId } = req.user;
        const { studyId } = req.params;
        const surveysforStudies = (await userIdIsAdminOfStudy(DbPool, studyId, userId))
            ? await allSurveysForStudy(DbPool, studyId)
            : await usersSurveysForStudy(DbPool, studyId, userId);
        let surveys: Survey[] = surveysforStudies.map(convertDatabaseSurveyToRestSurvey);
        surveys = surveys.filter(s => s !== null);
        res.send(surveys);
    })
);

router.put(
    '/studies/:studyId',
    return500OnError(
        return401OnUnauthorizedError(async (req: Request, res: Response) => {
            const { user_id: userId } = req.user;
            const study = camelcaseKeys(req.body as Study);
            const { studyId } = req.params;
            if (!(await userIdIsAdminOfStudy(DbPool, studyId, userId))) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            const { surveys } = study;
            const updatedStudy = await updateStudy(DbPool, { ...study, userId });
            if (surveys) {
                await Promise.all(
                    surveys.map(s => updateSurvey(DbPool, camelcaseKeys({ studyId, ...s })))
                );
            }
            res.status(200).send();
        })
    )
);

router.post(
    '/studies/:studyId/surveyors',
    return500OnError(
        return401OnUnauthorizedError(async (req, res) => {
            const { user_id: userId } = req.user;
            const { studyId } = req.params;
            const { email } = req.body;
            if (!(await userIdIsAdminOfStudy(DbPool, studyId, userId))) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            const [_, newUserId] = await giveUserStudyAccess(DbPool, email, studyId);
            res.send({ email, studyId, newUserId });
        })
    )
);

router.put(
    '/studies/:studyId/surveyors',
    return500OnError(
        return401OnUnauthorizedError(async (req, res) => {
            const { user_id: userId } = req.user;
            const { studyId } = req.params;
            const emails: string[] = req.body;
            if (!(await userIdIsAdminOfStudy(DbPool, studyId, userId))) {
                throw new UnauthorizedError(req.route, userId);
                return;
            }
            const emailsSet = new Set(emails);
            // get all the surveyors for the study
            const currentSurveyors = await getSurveyorsForStudy(DbPool, studyId);
            const currentSurveyorsSet = new Set(currentSurveyors);
            // these are the new surveyors
            const usersToAdd = emails.filter(e => !currentSurveyorsSet.has(e));
            // delete surveyors that are no longer in the latest request
            const usersToRemove = currentSurveyors.filter(e => !emailsSet.has(e));
            // return if it worked well
            const newUsers = await Promise.all(
                usersToAdd.map(async email => {
                    const [_, newUserId] = await giveUserStudyAccess(DbPool, email, studyId);
                    return { email, newUserId };
                })
            );

            const deleteUsers = await Promise.all(
                usersToRemove.map(async email => await deleteSurveyorFromStudy(DbPool, studyId, email))
            );
            res.send(newUsers);
        })
    )
);

router.delete(
    '/locations/:locationId',
    return500OnError(async (req: Request, res: Response) => {
        const { locationId } = req.params;
        try {
            await deleteLocation(DbPool, locationId);
        } catch (error) {
            if (error instanceof IdDoesNotExist) {
                res.status(404).end();
                return;
            }
            throw error;
        }
        res.status(200).end();
    })
);

export default router;
