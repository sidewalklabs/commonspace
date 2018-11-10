import dotenv from 'dotenv';
dotenv.config();

import * as bodyParser from 'body-parser';
import express from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import * as uuidv4 from 'uuid/v4';
import { createLocation } from './datastore';

import apiRouter from './routes/api';

import auth from './auth'
import DbPool from './database';

const PORT = process.env.NODE_PORT ? process.env.NODE_PORT : 3000;

const app = express();

auth(passport);
app.use(passport.initialize());

app.use(bodyParser.json());
if (process.env.NODE_ENV === 'development') {
    app.use('/', express.static('./dist'));
}
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

app.post('/signup', (req, res, next) => {
    passport.authenticate('signin',
                          {session: false, successRedirect: '/', failureRedirect: 'signup'},
                          (err, user)=> {
                              // TODO handle user already exists ....
                              if (err) throw err;
                              const token = jwt.sign(user, process.env.jwt_secret);
                              return res.json({token});
                          })(req, res, next)
})

app.post('/login', (req, res, next) => {
    passport.authenticate('login',
                          {session: false},
                          (err, user) => {
                              const token = jwt.sign(user, process.env.jwt_secret);
                              return res.json({token})
                          })(req, res, next);
})


if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/'
            }),
            (req, res) => {
                const token = jwt.sign(req.user, process.env.jwt_secret);
                return res.json({token});
            });
}

app.use('/api/v1', apiRouter);

async function processFeature(feature: any) {
    const { type: featureType, geometry, properties, id } = feature;
    if (featureType !== 'Feature') {
        throw new Error('must be a geojson feature')
    }
    const { type: geometryType, coordinates } = geometry;
    if (!id) {
        //@ts-ignore
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
