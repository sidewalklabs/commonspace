import * as dotenv from 'dotenv';
dotenv.config();

import * as bodyParser from 'body-parser';
import * as camelcaseKeys from 'camelcase-keys';
import express = require('express');
import DbPool from './database';
import { returnStudies, surveysForStudy, updateSurvey } from './datastore';


const PORT = 3000;

const app = express();

app.use(bodyParser.json());
app.use('/', express.static('.'));

namespace RestApi {
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
}



app.get('/studies', async (req, res) => {
    const pgRes = await returnStudies(DbPool, 'b44a8bc3-b136-428e-bee5-32837aee9ca2')  
    const studiesForUser: RestApi.Study[] = pgRes.rows.map(({study_id, title, protocol_version, emails}) => {
        return {
            study_id,
            title,
            protocol_version,
            surveyors: emails
        }
    })
    res.send(studiesForUser);
})

app.get('/studies/:studyId/surveys', async (req, res) => {
    const { studyId } = req.params;
    const pgRes = await surveysForStudy(DbPool, studyId); 
    console.log(pgRes.rowCount);
    const surveys: RestApi.Survey[] = pgRes.rows.map(({ survey_id, title, time_start, time_stop, location_id, email }) => {
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


app.put('/studies/:studyId', async (req, res) => {
    const { surveys, study_id }  = req.body as RestApi.Study;
    const pgQueries = await Promise.all(
        surveys.map(s => updateSurvey(DbPool, camelcaseKeys({study_id, ...s, userEmail: s.surveyor_email}))))
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
