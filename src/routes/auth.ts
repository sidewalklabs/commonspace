import cookieParser from 'cookie-parser';
import { randomBytes } from 'crypto';
import fs from 'fs';
import express, { Request, Response } from 'express';
import admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import { return500OnError } from './utils';
import {
    resetPassword,
    sendEmailResetLink,
    addToBlackList,
    emailForResetToken,
    saveTokenForPasswordReset,
    validateEmail,
    saveTokenForEmailVerification,
    sendSignupVerificationEmail
} from '../auth';
import DbPool from '../database';
import { User, UnverifiedUserError, findUserById } from '../datastore/user';
import { checkUserIsWhitelistApproved } from '../datastore/whitelist';
import { IdDoesNotExist } from '../datastore/utils';

// TODO https://firebase.google.com/docs/admin/setup#initialize_the_sdk
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firestoreDb = admin.firestore();

const N_RAND_BYTES = 32;

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

function respondWithCookie(res: Response, user: { user_id: string }) {
    res = addCookieToResponse(res, user, 'commonspacejwt', process.env.NODE_ENV !== 'development');
    return res.status(200).send();
}

function respondWithJWT(res: Response, user: { user_id: string }) {
    const token = jwt.sign(user, process.env.JWT_SECRET);
    return res.json({ token });
}

function respondWithAuthentication(req: Request, res: Response, user: { user_id: string }) {
    if (req.headers['accept'] && req.headers['accept'] === 'application/bearer.token+json') {
        return respondWithJWT(res, user);
    } else {
        return respondWithCookie(res, user);
    }
}

async function sendVerificationEmail(email: string, host: string) {
    try {
        const token = await createRandomStringForTokenUse();
        await saveTokenForEmailVerification(DbPool, email, token);
        await sendSignupVerificationEmail(host, email, token);
    } catch (error) {
        if (
            error === 'Missing credentials for "PLAIN"' &&
            process.env.NODE_ENV !== 'developement'
        ) {
            console.warn('Email Verification Not Setup');
        }
    }
}

async function createRandomStringForTokenUse(nBytes: number = N_RAND_BYTES) {
    const buffer = await randomBytes(nBytes);
    return buffer.toString('hex');
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
            const { email } = user;
            sendVerificationEmail(email, req.get('host'));
            return respondWithAuthentication(req, res, user);
        }
    )(req, res, next);
});

router.post('/login', (req, res, next) => {
    const { body } = req;
    // probably overkill but don't let anyone sign in as the sentinel user
    if (!body.email || body.email.toLowerCase() === 'sentinel@commonspace.sidewalklabs.com') {
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
        if (err instanceof UnverifiedUserError) {
            const errorMessage = `${err}`;
            res.statusMessage = errorMessage.toString();
            res.status(403).send({ error_message: errorMessage });
        } else if (err) {
            const errorMessage = `${err}`;
            res.statusMessage = errorMessage.toString();
            res.status(400).send({ error_message: errorMessage });
            return;
        } else {
            return respondWithAuthentication(req, res, user);
        }
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

router.post(
    '/resend_verification',
    return500OnError(async function(req: Request, res: Response) {
        const { email } = req.body;
        await sendVerificationEmail(email, req.get('host'));
        res.sendStatus(200);
    })
);

router.get(
    '/verify',
    return500OnError(async function(req: Request, res: Response) {
        const { token } = req.query;
        const userId = await validateEmail(DbPool, token);
        if (userId) {
            return respondWithAuthentication(req, res, { user_id: userId });
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

console.log('env: ', process.env.NODE_ENV);
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
    console.log('router add firebase token');
    router.post(
        '/firebase/token',
        return500OnError(async function(req: Request, res: Response) {
            console.log('received body: ', JSON.stringify(req.body));
            const { firebase_id_token: token } = req.body;
            let decodedToken;
            try {
                decodedToken = await admin.auth().verifyIdToken(token);
            } catch (error) {
                res.status(401).send({ error_message: 'invalid firebase jwt' });
                return;
            }
            const { uid: firebaseUid } = decodedToken;
            console.log('firebase id: ', firebaseUid);
            // todo from firestore get the pg database user id and create a payload to send
            const firestoreUserMapping = await firestoreDb
                .collection('users')
                .doc(firebaseUid)
                .get();
            console.log('does this exist: ', firestoreUserMapping.exists);
            if (!firestoreUserMapping.exists) {
                console.error(`could not find firebase user in firestore: ${firebaseUid}`);
                res.status(409).send();
                return;
            }
            const firestoreData = firestoreUserMapping.data();
            console.log('firestore data: ', firestoreData);
            try {
                const { user_id } = await findUserById(DbPool, firestoreData.postgresId);
                console.log('postgres user id: ', user_id);
                return respondWithAuthentication(req, res, { user_id });
            } catch (error) {
                if (error instanceof IdDoesNotExist) {
                    res.status(409).send({
                        error_message: `user not found for firebase user: ${firestoreData}`
                    });
                } else {
                    console.error(`error fetching user from postgres db: ${firestoreData}`);
                    throw error;
                }
            }
        })
    );
}

export default router;
