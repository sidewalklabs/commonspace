import "babel-polyfill";

import { Request, Response } from 'express';
import * as pg from 'pg';
import * as uuidv4 from 'uuid/v4';

import { createStudy, createUser, giveUserStudyAcess } from './datastore';

const pgConnectionInfo = {
    connectionLimit: 1,
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name
}

const pool = new pg.Pool(pgConnectionInfo);

// Return a newly generated UUID in the HTTP response.
export async function saveNewUser(req: Request, res: Response) {
    const { userId, email, name } = req.body;
    console.log(req.body);
    const resultFromSave = await createUser(pool, { userId, email, name });
    res.send(req.body);
};

export async function saveNewStudy(req: Request, res: Response) {
    const study = req.body;
    study.studyId = study.studyId ? study.studyId : uuidv4();
    await createStudy(pool, study, ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location'])
    res.send({ study });
}

export async function saveNewSurvey(req: Request, res: Response) {
    const { user, survey } = req.body;
    survey.surveyId = survey.surveyId ? survey.surveyId : uuidv4();
}

export async function addSurveyorToStudy(req: Request, res: Response) {
    try {
        const { userEmail, studyId } = req.body;
        await giveUserStudyAcess(pool, userEmail, studyId);
        res.send({ userEmail, studyId });
    } catch (error) {
        console.error(`failure to give user access for : ${req.body}| pg connection: ${JSON.stringify(pgConnectionInfo)}`);
        throw error;
    }
}
