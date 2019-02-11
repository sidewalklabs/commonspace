import express, { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import { return500OnError } from './utils';
import { resetPassword, sendEmailResetLink, addToBlackList, createRandomStringForTokenUse, emailForResetToken, saveTokenForPasswordReset, tokenIsBlacklisted, validateEmail} from '../auth';
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

export async function checkAgainstTokenBlacklist(req: Request, res: Response, next) {
    if (await tokenIsBlacklisted(DbPool, req)) {
        res.status(401).send();
        return;
    }
    next();
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
    const { email } = body;
    const token = await createRandomStringForTokenUse();
    await saveTokenForPasswordReset(DbPool, email, token);
    await sendEmailResetLink(email, token);
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

const BEARER_REGEX = /^bearer (.*)?/
router.post('/logout',
            passport.authenticate("jwt", { session: false }),
            return500OnError(async (req: Request, res: Response) => {
                const { user_id: userId } = req.user;
                await addToBlackList(DbPool, userId, req);
                res.status(200).send();
            }))

router.get('/verify', return500OnError(async function(req,res){
    const { token, email } = req.query;
    if (await validateEmail(DbPool, email, token)) {
        res.redirect('/studies')
        return;
    }
    res.status(400);
}))

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
