import * as dotenv from 'dotenv';
dotenv.config();

import * as bodyParser from 'body-parser';
import express = require('express');
import DbPool from './database';
import { returnStudies, surveysForStudy } from './datastore';


const PORT = 3000;

const app = express();

app.use(bodyParser.json());
app.use('/', express.static('.'));

interface Survey {
    title: string;
    start_time: string;
    end_time: string;
    location_id: string;
    surveyor_email: string;
}

interface Study {
    study_id: string;
    title: string;
    protocol_version: string;
    surveyors: string[];
    surveys?: Survey[];
}

app.get('/studies', async (req, res) => {
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

app.get('/studies/:studyId/surveys', async (req, res) => {
    const { studyId } = req.params;
    const pgRes = await surveysForStudy(DbPool, studyId); 
    console.log(pgRes.rowCount);
    const surveys = pgRes.rows.map(({ survey_id, time_start, time_stop, location_id, email }) => {
        console.log(survey_id);
        return {
            survey_id,
            location_id,
            start_date: time_start,
            end_date: time_stop,
            surveyor_email: email
        }
    });
    res.send(surveys);
})

app.put('/studies/:studyId', async (req, res) => {
    const study = req.body as Study;
    const surveys = study.surveys;
    console.log(surveys);
    surveys.forEach(console.log);
});


app.listen(PORT, () => console.log(`listening on port ${PORT}`));
