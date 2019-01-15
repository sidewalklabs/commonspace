import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: process.env.DOTENV_CONFIG_DIR ? path.join(process.env.DOTENV_CONFIG_DIR, '.env'): ''});

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

if (process.env.NODE_ENV === 'development') {
    app.use('/', express.static('./dist'));
    app.get('/*', function(req, res) {
        res.sendFile(path.join(__dirname, '../dist/index.html'), function(err) {
            if (err) {
                res.status(500).send(err)
            }
        })
    })
}

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
