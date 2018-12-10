import dotenv from 'dotenv';
dotenv.config();

import * as bodyParser from 'body-parser';
import express from 'express';
import passport from 'passport';

import auth from './auth'
import apiRouter from './routes/api';
import authRouter from './routes/auth';


const PORT = process.env.NODE_PORT ? process.env.NODE_PORT : 3000;

const app = express();

auth(passport);
app.use(passport.initialize());

app.use(bodyParser.json());
if (process.env.NODE_ENV === 'development') {
    app.use('/', express.static('./dist'));
}

app.use(function (req, res, next) {
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

app.use('/auth', authRouter);
app.use('/api', apiRouter);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
