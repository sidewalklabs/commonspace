import "babel-polyfill";

import { Request, Response } from 'express';
import * as pg from 'pg';
import * as uuid from 'uuid';

import { addDataPointToSurveyNoStudyId, addDataPointToSurveyWithStudyId, createLocation, createNewSurveyForStudy, createStudy, createUser, deleteDataPoint, giveUserStudyAcess, GehlFields } from './datastore';

const pgConnectionInfo = {
    connectionLimit: 1,
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name
}

const pool = new pg.Pool(pgConnectionInfo);

// TODO: we only support one set of study parameters for now
const STUDY_FIELDS: GehlFields[] = ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location', 'note'];

async function errorHandle<T>(req: Request, res: Response, f: (...args: any[]) => Promise<T>) {
    try {
        return res.send(await f(req.body));
    } catch (error) {
        console.error(`[body: ${JSON.stringify(req.body)}] ${error}`)
        throw error;
    }
}

// Return a newly generated UUID in the HTTP response.
export async function saveNewUser(req: Request, res: Response) {
    return errorHandle(req, res, async (user) => {
        // note uuidv4() does not work in the cloud
        user.userId = user.userId ? user.userId : uuid.v4();
        await createUser(pool, user);
        res.send(user);
    });
};

export async function saveNewStudy(req: Request, res: Response) {
    return errorHandle(req, res, async (study) => {
        study.studyId = study.studyId ? study.studyId : uuid.v4();
        await createStudy(pool, study, STUDY_FIELDS);
        res.send(study);
    });
}

export async function saveNewSurvey(req: Request, res: Response) {
    return errorHandle(req, res, async (survey) => {
        survey.surveyId = survey.surveyId ? survey.surveyId : uuid.v4();
        await createNewSurveyForStudy(pool, survey);
        res.send(survey);
    });

}

export async function addSurveyorToStudy(req: Request, res: Response) {
    return errorHandle(req, res, async ({ userEmail, studyId }) => {
        const [_, newUserId] = await giveUserStudyAcess(pool, userEmail, studyId);
        res.send({ userEmail, studyId, newUserId });
    });
}

export async function saveNewLocation(req: Request, res: Response) {
    return errorHandle(req, res, async (location) => {
        location.locationId = location.locationId ? location.locationId : uuid.v4();
        await createLocation(pool, location);
        return location;
    })
}

export async function saveDataPointToStudy(req: Request, res: Response) {
    return errorHandle(req, res, async ({ study_id: studyId, survey_id: surveyId, ...dataPoint }) => {
        if (studyId) {
            await addDataPointToSurveyWithStudyId(pool, studyId, surveyId, dataPoint)
        } else {
            await addDataPointToSurveyNoStudyId(pool, surveyId, dataPoint);
        }
        return dataPoint;
    });
}

export async function deleteDataPointFromStudy(req: Request, res: Response) {
    return errorHandle(req, res, async ({ data_point_id: dataPointId, survey_id: surveyId }) => {
        await deleteDataPoint(pool, surveyId, dataPointId);
        return { dataPointId, surveyId };
    });
}
