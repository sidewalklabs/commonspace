import express, { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import { return500OnError } from './utils';
import { emailForResetToken, resetPassword, sendEmailResetLink} from '../auth';
import DbPool from '../database'
import { User } from '../datastore/user';

const router = express.Router();

function addCookieToResponse(res, payload, name: string, secure: boolean) {
    const expires = new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION_MS))
    const jwtPayload = {
        ...payload,
        expires
    };
    const cookieOptions =  secure ?
        { expires, httpOnly: true, secure: true} :
        { expires }
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET);
    res.cookie(name, token, cookieOptions);
    return res;
}

function respondWithCookie(res: Response, user: User) {
    res = addCookieToResponse(res, user, 'commonspacejwt', process.env.NODE_ENV !== 'development');
    res = addCookieToResponse(res, {stuff: 'nothing'}, 'commonspacepsuedo', false);
    res.status(200).send();
    return;
}

function respondWithJWT(res: Response, user: User) {
    const token = jwt.sign(user, process.env.JWT_SECRET);
    return res.json({token});
}

function respondWithAuthentication(req: Request, res: Response, user: User) {
    if (req.headers['accept'] && req.headers['accept'] === 'application/bearer.token+json') {
        return respondWithJWT(res, user);
    } else {
        return respondWithCookie(res, user);
    }
}

router.post('/signup', (req, res, next) => {
    const body = req.body;
    if (!body.email) {
        res.statusMessage = 'Missing email field'
        res.status(400).send();
        return;
    }
    if (!body.password) {
        res.statusMessage = 'Missing password field'
        res.status(400).send();
        return;
    }
    passport.authenticate('signup',
                          {session: false, successRedirect: '/', failureRedirect: '/signup'},
                          (err, user)=> {
                              if (err) {
                                  res.statusMessage = err;
                                  res.status(400).send();
                                  return;
                              }
                              return respondWithAuthentication(req, res, user);
                          })(req, res, next);
});

router.post('/login', (req, res, next) => {
    const { body } = req;
    if (!body.email) {
        res.statusMessage = 'Missing email field'
        res.status(400).send();
        return;
    } if (!body.password) {
        res.statusMessage = 'Missing password field'
        res.status(400).send();
        return;
    }
    passport.authenticate('login',
                          {session: false},
                          (err, user) => {
                              if (err) {
                                  res.statusMessage = err;
                                  res.status(400).send();
                                  return;
                              }
                              return respondWithAuthentication(req, res, user);
                          })(req, res, next);
})

router.post('/request_reset_password', return500OnError(async (req: Request, res: Response) => {
    const { body } = req;
    if (!body.email) {
        res.statusMessage = 'Missing email field'
        res.status(400).send();
    }
    await sendEmailResetLink(body.email);
    res.status(200).send();
}));

router.post('/reset_password', return500OnError(async (req: Request, res: Response) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!token || !password) {
        res.status(404).send();
        return;
    }
    await resetPassword(DbPool, password, token);
    res.status(200).send();
    return
}))

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

if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    router.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    router.get('/google/callback',
            passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/'
            }),
            (req: Request, res: Response) => {
                return respondWithAuthentication(req, res, req.user);
            });
    router.get('/google/token',
               passport.authenticate('google-token', {session: false}),
               (req: Request, res: Response) => {
                   return respondWithAuthentication(req, res, req.user);
               })
}

export default router;
