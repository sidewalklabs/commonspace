import camelcaseKeys from 'camelcase-keys';
import express from 'express';
import fetch from 'node-fetch';
import passport from 'passport';
import uuid from 'uuid';

import { UNIQUE_VIOLATION } from 'pg-error-constants';

import { createNewSurveyForStudy, createStudy, giveUserStudyAccess, returnStudies, surveysForStudy, updateSurvey, GehlFields, createLocation } from '../datastore';
import DbPool from '../database';
import { FeatureCollection, Feature } from 'geojson';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse?format=json'

const router = express.Router()

export interface Survey {
    survey_id: string;
    title?: string;
    location_id: string;
    start_date: string;
    end_date: string;
    surveyor_email: string;
}

export interface Study {
    study_id: string;
    title: string;
    protocol_version: string;
    surveyors: string[];
    surveys?: Survey[];
}

const STUDY_FIELDS: GehlFields[] = ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location', 'note'];

router.use(passport.authenticate('jwt', {session: false}))

router.get('/studies', async (req, res) => {
    const { user_id: userId } = req.user;
    const pgRes = await returnStudies(DbPool, userId);
    const studiesForUser: Study[] = pgRes.rows.map(({study_id, title, protocol_version, emails, map}) => {
        return {
            study_id,
            title,
            protocol_version,
            map,
            surveyors: emails
        }
    })
    res.send(studiesForUser);
})

async function saveGeoJsonFeatureAsLocation(x: Feature | FeatureCollection) {
    if (x.type === 'Feature' && x.geometry.type === 'Polygon') {
        const { geometry, properties} =  x;
        const {location_id: locationId, name: namePrimary } = properties;
        const { coordinates } = geometry;
        const [lngs, lats] = geometry.coordinates[0].reduce(([lngs, lats], [lng, lat]) => {
            return [lngs + lng, lats + lat]
        }, [0, 0]);
        const lngCenterApprox = lngs / geometry.coordinates[0].length;
        const latCenterApprox = lats / geometry.coordinates[0].length;
        const url = NOMINATIM_BASE_URL + `&lat=${latCenterApprox}&lon=${lngCenterApprox}`;
                    console.log(url);
        const response = await fetch(url);
        const body = await response.json();
        const { county = '', city = '', country = '', county: subdivision = '' } = body;
        return createLocation(DbPool, {locationId, namePrimary, city, country, subdivision, geometry});
    }
}

interface NewStudy extends Study {
    map?: FeatureCollection;
}

router.post('/studies', async (req, res) => {
    const { user_id: userId } = req.user;
    const {protocol_version: protocolVersion, study_id: studyId, title, surveyors, surveys = [], map} = req.body as NewStudy;
    try {
        await createStudy(DbPool, { studyId, title, protocolVersion, userId, map}, STUDY_FIELDS);
    } catch (error) {
        const {code, detail} = error;
        if (code === UNIQUE_VIOLATION) {
            res.statusMessage = 'survey_id not valid';
            res.status(409).send();
        }
        throw error;
    }
    const newUserIds = await Promise.all(
        surveyors.map(async email => {
            const [_, newUserId] = await giveUserStudyAccess(DbPool, email, studyId)
            return newUserId;
        })
    );
    if (map) {
        const surveyZoneIds = await Promise.all(
            map.features.map(saveGeoJsonFeatureAsLocation)
        )
    }
    await Promise.all(
        surveys.map(async survey => {
            return createNewSurveyForStudy(DbPool, camelcaseKeys({studyId, ...survey, userEmail: survey.surveyor_email}))
        })
    )
    res.send(req.body)
});

router.get('/studies/:studyId/surveys', async (req, res) => {
    // TODO only return studies where the user is verfied
    const { user_id: userId } = req.user;
    const { studyId } = req.params;
    const pgRes = await surveysForStudy(DbPool, studyId);
    const surveys: Survey[] = pgRes.rows.map(({ survey_id, title, time_start, time_stop, location_id, email }) => {
        return {
            survey_id,
            title,
            location_id,
            start_date: time_start,
            end_date: time_stop,
            surveyor_email: email
        }
    });
    res.send(surveys);
})

router.put('/studies/:studyId', async (req, res) => {
    const { surveys, study_id }  = req.body as Study;
    const pgQueries = await Promise.all(
        surveys.map(s => updateSurvey(DbPool, camelcaseKeys({study_id, ...s, userEmail: s.surveyor_email}))))
    res.sendStatus(200);
});

router.post('/studies/:studyId/surveyors', async (req, res) => {
    const { studyId } = req.params;
    const { email } = req.body;
    const [_, newUserId] = await giveUserStudyAccess(DbPool, email, studyId);
    res.send({ email, studyId, newUserId })
});




export default router;
