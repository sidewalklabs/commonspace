import * as camelcaseKeys from 'camelcase-keys';
import express from 'express';
import passport from 'passport';

import { giveUserStudyAccess, returnStudies, surveysForStudy, updateSurvey } from '../datastore';
import DbPool from '../database';

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

router.use(passport.authenticate('jwt', {session: false}))

router.get('/studies', async (req, res) => {
    console.log('api: ', req.user);
    const pgRes = await returnStudies(DbPool, 'b44a8bc3-b136-428e-bee5-32837aee9ca2')
    const studiesForUser: Study[] = pgRes.rows.map(({study_id, title, protocol_version, emails}) => {
        return {
            study_id,
            title,
            protocol_version,
            surveyors: emails
        }
    })
    res.send(studiesForUser);
})

router.get('/studies/:studyId/surveys', async (req, res) => {
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
    const { email} = req.body;
    const [_, newUserId] = await giveUserStudyAccess(DbPool, email, studyId);
    res.send({ email, studyId, newUserId })
});




export default router;
