import * as dotenv from 'dotenv';
dotenv.config();

import * as bodyParser from 'body-parser';
import * as camelcaseKeys from 'camelcase-keys';
import express = require('express');
import * as jwt from 'jsonwebtoken';
import  * as passport from 'passport';
import * as uuidv4 from 'uuid/v4';
import { createLocation, createUser, giveUserStudyAcess, returnStudies, surveysForStudy, updateSurvey } from './datastore';

import auth from './auth'
import DbPool from './database';

const PORT = 3000;

const app = express();

auth(passport);
app.use(passport.initialize());

app.use(bodyParser.json());
app.use('/', express.static('.'));
app.use('/digitalshadow', express.static('./map-annotation'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

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

app.post('/signup', (req, res, next) => {
    passport.authenticate('local',
                          {session: false, successRedirect: '/', failureRedirect: 'signup'},
                          (err, user, info)=> {
                              if (err) throw err;
                              const token = jwt.sign(user, 'secret');
                              return res.json({user, token});
                          })(req, res, next)
})

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

app.post('/studies/:studyId/surveyors', async (req, res) => {
    const { studyId } = req.params;
    const { email} = req.body;
    const [_, newUserId] = await giveUserStudyAcess(DbPool, email, studyId);
    res.send({ email, studyId, newUserId })
});

async function processFeature(feature) {
    const { type: featureType, geometry, properties, id } = feature;
    if (featureType !== 'Feature') {
        throw new Error('must be a geojson feature')
    }
    const { type: geometryType, coordinates } = geometry;
    if (!id) {
        feature.id = uuidv4();
    }
    // todo add geocoding logic
    await createLocation(DbPool, {
        locationId: feature.id,
        namePrimary: properties.name,
        geometry,
        country: '',
        city: '',
        subdivision: ''
    });
    console.log('f: ', feature);
    return feature;
}

app.post('/locations', async (req, res) => {
    const { type, features } = req.body;
    const response = await Promise.all(features.map(processFeature));
    console.log(response);
    res.send({type, features: response });
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
