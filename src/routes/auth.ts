import express from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';

//import DbPool from "../database";
//import { removeEmail } from '../datastore/emailVerify';

const router = express.Router();

function addCookieToResponse(res, payload) {
    const expires = new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION_MS))
    const jwtPayload = {
        ...payload,
        expires
    };
    const cookieOptions =  process.env.NODE_ENV === 'development' ?
        { expires, httpOnly: true} :
        { expires, httpOnly: true, secure: true }
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET);
    res.cookie('commonspacejwt', token, cookieOptions);
    //res.cookie('commonspaceloggedin', {login: true}, {expires});
    return res;
}

router.post('/signup', (req, res, next) => {
    const body = req.body;
    if (!body.email) {
        res.statusMessage = 'Missing email field'
        res.status(400).send();
    } if (!body.password) {
        res.statusMessage = 'Missing password field'
        res.status(400).send();
    }
    passport.authenticate('signup',
                          {session: false, successRedirect: '/', failureRedirect: '/signup'},
                          (err, user)=> {
                              if (err) {
                                  res.statusMessage = err;
                                  res.status(400).send();
                                  return;
                              }
                              res = addCookieToResponse(res, user);
                              res.status(200).send();
                              return;
                          })(req, res, next);
});

router.post('/login', (req, res, next) => {
    const { body } = req;
    if (!body.email) {
        res.statusMessage = 'Missing email field'
        res.status(400).send();
    } if (!body.password) {
        res.statusMessage = 'Missing password field'
        res.status(400).send();
    }
    passport.authenticate('login',
                          {session: false},
                          (err, user) => {
                              if (err) {
                                  res.statusMessage = err;
                                  res.status(400).send();
                                  return;
                              }
                              res = addCookieToResponse(res, user);
                              res.status(200).send();
                              return;
                          })(req, res, next);
    })

// router.get('/verify', return500OnError(function(req,res){
//     const { id, email } = req.query;
//     try {
//         const linkId = removeEmail(DbPool, email, id);
//         console.log("email is verified");
//         res.end(`<h1>Email ${email} has been Successfully verified`);
//         console.log("Domain is matched. Information is from Authentic email");
//     } catch (error) {
//         console.log("email is not verified");
//         res.end("<h1>Bad Request</h1>");
//     }
// }))
;

if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    router.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    router.get('/google/callback',
            passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/'
            }),
            (req, res) => {
                const token = jwt.sign(req.user, process.env.JWT_SECRET);
                return res.json({token});
            });
    router.get('/google/token',
               passport.authenticate('google-token', {session: false}),
               (req, res) => {
                   const token = jwt.sign(req.user, process.env.JWT_SECRET);
                   return res.json({token});
               })
}

export default router;
