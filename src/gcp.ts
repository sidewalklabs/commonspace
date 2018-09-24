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
const studyFields: GehlFields[] = ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location', 'note'];

// Return a newly generated UUID in the HTTP response.
export async function saveNewUser(req: Request, res: Response) {
    try {
        const user = req.body;
        // note uuidv4() does not work in the cloud
        user.userId = user.userId ? user.userId : uuid.v4();
        const resultFromSave = await createUser(pool, user);
        res.send(user);
    } catch (error) {
        console.error(`Could not save user using request body: ${JSON.stringify(req.body)}, error: ${error}`);
    }
};

export async function saveNewStudy(req: Request, res: Response) {
    try {
        const study = req.body;
        study.studyId = study.studyId ? study.studyId : uuid.v4();
        await createStudy(pool, study, studyFields);
        res.send(study);
    } catch (error) {
        console.error(`Could not save study using request body: ${JSON.stringify(req.body)}, error: ${error}`);
    }
}

export async function saveNewSurvey(req: Request, res: Response) {
    try {
        const survey = req.body;
        survey.surveyId = survey.surveyId ? survey.surveyId : uuid.v4();
        await createNewSurveyForStudy(pool, survey);
        res.send(survey);
    } catch (error) {
        console.error(`failure to save new survey : ${JSON.stringify(req.body)}| pg connection: ${JSON.stringify(pgConnectionInfo)}`);
        throw error;
    }
}

export async function addSurveyorToStudy(req: Request, res: Response) {
    try {
        const { userEmail, studyId } = req.body;
        const [_, newUserId] = await giveUserStudyAcess(pool, userEmail, studyId);
        res.send({ userEmail, studyId, newUserId });
    } catch (error) {
        console.error(`failure to give user survey access, payload: ${JSON.stringify(req.body)}| pg connection: ${JSON.stringify(pgConnectionInfo)}`);
        throw error;
    }
}

export async function saveNewLocation(req: Request, res: Response) {
    try {
        const location = req.body;
        location.locationId = location.locationId ? location.locationId : uuid.v4();
        await createLocation(pool, location);
        res.send(location);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function saveDataPointToStudy(req: Request, res: Response) {
    const { study_id: studyId, survey_id: surveyId, ...dataPoint } = req.body;
    try {
        if (studyId) {
            await addDataPointToSurveyWithStudyId(pool, studyId, surveyId, dataPoint)
        } else {
            await addDataPointToSurveyNoStudyId(pool, surveyId, dataPoint);
        }
    } catch (error) {
        console.error(`error saving data point for payload: ${JSON.stringify(req.body)}`);
        throw error;
    }
    res.send(dataPoint);
}

export async function deleteDataPointFromStudy(req: Request, res: Response) {
    const { data_point_id: dataPointId, survey_id: surveyId } = req.body;
    try {
        deleteDataPoint(pool, surveyId, dataPointId);
    } catch (error) {
        console.error(`error saving data point for payload: ${JSON.stringify(req.body)}`);
    }
    res.send({ data_point_id: dataPointId, survey_di: surveyId });
}
