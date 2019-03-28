import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import { return500OnError } from './utils';
import {
    resetPassword,
    sendEmailResetLink,
    addToBlackList,
    createRandomStringForTokenUse,
    emailForResetToken,
    saveTokenForPasswordReset,
    validateEmail,
    sendSignupVerificationEmail
} from '../auth';
import DbPool from '../database';
import { User } from '../datastore/user';
import { checkUserIsWhitelistApproved } from '../datastore/whitelist';
import { return401OnUnauthorizedError, UnauthorizedError } from './errors';

const router = express.Router();

router.use(cookieParser());

function addCookieToResponse(res, payload, name: string, secure: boolean) {
    const expires = new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION_MS));
    const jwtPayload = {
        ...payload,
        expires
    };
    const cookieOptions = secure ? { expires, httpOnly: true, secure: true } : { expires };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET);
    res.cookie(name, token, cookieOptions);
    return res;
}

function respondWithCookie(res: Response, user: User) {
    res = addCookieToResponse(res, user, 'commonspacejwt', process.env.NODE_ENV !== 'development');
    res.status(200).send();
    return;
}

function respondWithJWT(res: Response, user: User) {
    const token = jwt.sign(user, process.env.JWT_SECRET);
    return res.json({ token });
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
        const errorMessage = 'Missing email field';
        res.statusMessage = errorMessage;
        res.status(400).send({ error_message: errorMessage });
        return;
    }
    if (!body.password) {
        const errorMessage = 'Missing password field';
        res.statusMessage = errorMessage;
        res.status(400).send({ error_message: errorMessage });
        return;
    }
    passport.authenticate(
        'signup',
        { session: false, successRedirect: '/', failureRedirect: '/signup' },
        async (err, user) => {
            if (err) {
                const errorMessage = `${err}`;
                res.statusMessage = errorMessage;
                res.status(400).send({ error_message: errorMessage });
                return;
            }
            try {
                await sendSignupVerificationEmail(req.get('host'), user.email, user.token);
            } catch (error) {
                if (
                    error === 'Missing credentials for "PLAIN"' &&
                    process.env.NODE_ENV === 'STAGING'
                ) {
                    console.warn('Email Not Setup');
                }
            }
            return respondWithAuthentication(req, res, user);
        }
    )(req, res, next);
});

router.post('/login', (req, res, next) => {
    const { body } = req;
    if (!body.email) {
        const errorMessage = 'Missing email field';
        res.statusMessage = errorMessage;
        res.status(400).send({ error_message: errorMessage });
        return;
    }
    if (!body.password) {
        const errorMessage = 'Missing password field';
        res.statusMessage = errorMessage;
        res.status(400).send({ error_message: errorMessage });
        return;
    }
    passport.authenticate('login', { session: false }, (err, user) => {
        if (err) {
            const errorMessage = `${err}`;
            res.statusMessage = errorMessage.toString();
            res.status(400).send({ error_message: errorMessage });
            return;
        }
        return respondWithAuthentication(req, res, user);
    })(req, res, next);
});

router.post(
    '/request_reset_password',
    return500OnError(async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) {
            const errorMessage = 'Missing email field';
            res.statusMessage = errorMessage;
            res.status(400).send({ error_message: errorMessage });
        }
        const token = await createRandomStringForTokenUse();
        // TODO: only if the user exists in the database already
        await saveTokenForPasswordReset(DbPool, email, token);
        await sendEmailResetLink(req.get('host'), email, token);
        res.status(200).send();
    })
);

router.post(
    '/reset_password',
    return500OnError(async (req: Request, res: Response) => {
        const { token } = req.query;
        const { password } = req.body;
        if (!token || !password) {
            res.status(404).send();
            return;
        }
        await resetPassword(DbPool, password, token);
        res.status(200).send();
        return;
    })
);

router.post(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    return500OnError(async (req: Request, res: Response) => {
        const { user_id: userId } = req.user;
        await addToBlackList(DbPool, userId, req);
        res.clearCookie('commonspacejwt');
        res.status(200).send();
    })
);

router.get(
    '/verify',
    return500OnError(async function(req, res) {
        const { token, email } = req.query;
        if (await validateEmail(DbPool, email, token)) {
            return respondWithAuthentication(req, res, req.user);
        }
        res.status(400);
    })
);

router.post(
    '/check_whitelist',
    return500OnError(async (req: Request, res: Response) => {
        const { body } = req;
        if (!body.email) {
            const errorMessage = 'Missing email field';
            res.statusMessage = errorMessage;
            res.status(400).send({ error_message: errorMessage });
            return;
        }
        if (!(await checkUserIsWhitelistApproved(DbPool, body.email))) {
            const errorMessage = 'Not Whitelist Approved';
            res.statusMessage = errorMessage;
            res.status(401).send({ error_message: errorMessage });
        }
        res.status(200).send();
    })
);

if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get(
        '/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        }),
        (req: Request, res: Response) => {
            return respondWithAuthentication(req, res, req.user);
        }
    );
    router.get(
        '/google/token',
        passport.authenticate('google-token', { session: false }),
        (req: Request, res: Response) => {
            return respondWithAuthentication(req, res, req.user);
        }
    );
}

export default router;
