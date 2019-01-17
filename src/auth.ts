import crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as passport from 'passport';
import * as passportGoogle from 'passport-google-oauth20';
import * as passportJWT from 'passport-jwt'
import * as passportLocal from 'passport-local';
import {Pool} from 'pg';
import nodemailer from 'nodemailer';
import GoogleTokenStrategy from './passport_strategies/GoogleTokenStrategy';
import path from 'path';
import * as uuid from 'uuid';

import { authenticateOAuthUser, createUser, findUserWithPassword, findUserById, User, changeUserPassword } from './datastore/user';
import DbPool from './database';

import dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_DIR ? path.join(process.env.DOTENV_CONFIG_DIR, '.env'): ''});

const LocalStrategy = passportLocal.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const GoogleStrategy = passportGoogle.Strategy;
const JwtStrategy  = passportJWT.Strategy;
const MAX_PASSWORD_LENGTH = 1000
const MIN_PASSWORD_LENGTH = 7
const SPECIAL_CHARACTERS = ['!', '@', '#', '$', '%', '^', '&', '*', '?']

const N_RAND_BYTES = 32;

const SMTP_TRANSPORT = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

async function saveTokenForPasswordReset(pool: Pool, email: string, token: string): Promise<void> {
    const query = `INSERT INTO password_reset (email, token)
                   VALUES ($1, $2)
                   ON CONFLICT (email)
                   DO
                     UPDATE
                     SET token = $3`
    const values = [email, token, token];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${values}] ${error}`);
        throw error;
    }
}

async function removePasswordResetToken(pool: Pool, token: string): Promise<void> {
    const query = `DELETE FROM password_reset
                   WHERE token = $1`
    const values = [token];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${values}] ${error}`);
        throw error;
    }
}

export async function emailForResetToken(pool: Pool, token: string): Promise<string> {
    const query = `SELECT email from password_reset
                   WHERE token = $1`
    const values = [token];
    try {
        const {rowCount, rows } = await pool.query(query, values);
        if (rowCount !== 1) {
            throw new Error(`Invalid token`)
        }
        const { email } = rows[0];
        return email;
    } catch (error) {
        console.error(`[query ${query}][values ${values}] ${error}`);
        throw error;
    }
}

export async function resetPassword(pool: Pool, password:string, token: string): Promise<void> {
    const email = await emailForResetToken(DbPool, token);
    if (email) {
        checkPasswordRequirements(password);
        await changeUserPassword(DbPool, email, password);
        await removePasswordResetToken(pool, token);
    }
    return;
}

export async function sendEmailResetLink(email: string) {
    const buffer = await crypto.randomBytes(N_RAND_BYTES);
    const token = buffer.toString('hex');
    const link = `${process.env.SERVER_HOSTNAME}/reset_password?token=${token}`
    const html = `Hello ${email},<br> Please Click on the link to reset your email.<br><a href="${link}">Click Here To Reset</a>`
    const mailOptions: nodemailer.SendMailOptions = {
        from: `Gehl Data Collector <thorncliffeparkpubliclifepilot@gmail.com>`,
        to: email,
        subject: 'Password reset for CommonSpace',
        html
    };
    try {
        await SMTP_TRANSPORT.sendMail(mailOptions);
        await saveTokenForPasswordReset(DbPool, email, token)
    } catch (error) {
        console.error(`[mailOptions ${JSON.stringify(mailOptions)}] [mailUrl ${link}] ${error}`)
        throw error;
    }
}

export function sendSignupVerificationEmail(host: string, email: string) {
    const rand = Math.floor((Math.random() * 100) + 39);
    const link = encodeURI(`${process.env.SERVER_HOSTNAME}/verify?id=${rand}&email=${email}`);
    const mailOptions: nodemailer.SendMailOptions = {
        from: `Gehl Data Collector <thorncliffeparkpubliclifepilot@gmail.com>`,
        to: email,
        subject: 'Invite to collect survey data for a study',
        html : `Hello,<br> Please Click on the link to verify your email.<br><a href="${link}">Click here to verify</a>`
    };
    console.log(`add new user: ${JSON.stringify(mailOptions)}`);
    SMTP_TRANSPORT.sendMail(mailOptions);
}

export class PasswordValidationError extends Error {}

export function checkPasswordRequirements(password: string): string {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new PasswordValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        throw new PasswordValidationError(`Password must be less than ${MAX_PASSWORD_LENGTH} characters long`);
    }
    const specialCharacterPresent = SPECIAL_CHARACTERS.reduce((acc, curr) => {
        if (acc) {
            return acc;
        }
        return password.indexOf(curr) !== -1;
    }, false);
    if (!specialCharacterPresent) {
        throw new PasswordValidationError(`Password must contain one special character from: ${JSON.stringify(SPECIAL_CHARACTERS)}`);
    }
    return password;
}

const signupStrategy = new LocalStrategy({passReqToCallback: true, usernameField: 'email'}, async (req, email, password, done) => {
    try {
        const userId = uuid.v4();
        const user = {email, password: checkPasswordRequirements(password), userId, name: '' };
        await createUser(DbPool, user);
        // await sendSignupVerificationEmail(req.get('host'), user.email);
        req.user = user;
        return done(null, {user_id: userId, email})
    } catch (err) {
        console.error(`[body ${JSON.stringify(req.body)}][params: ${JSON.stringify(req.params)}] ${err}`);
        return done(err, null)
    }
})

const loginStrategy = new LocalStrategy({passReqToCallback: true, usernameField: 'email'}, async (req, email, password, done) => {
    try {
        const user = await findUserWithPassword(DbPool, email, password);
        return done(null, {user_id: user.user_id});
    } catch (err) {
        console.error(`[body ${JSON.stringify(req.body)}][params: ${JSON.stringify(req.params)}] ${err}`);
        return done(err, null);
    }
})

const extractAuthBearer = ExtractJwt.fromAuthHeaderAsBearerToken();

function jwtFromRequest(req) {
    if (req.cookies && req.cookies.commonspacejwt) {
        return req.cookies.commonspacejwt;
    } else {
        return extractAuthBearer(req);
    }
}

const jwtOptions = {
    jwtFromRequest,
    secretOrKey: process.env.JWT_SECRET
}

const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
    const {user_id: userId} = jwt_payload;
    const user =  await findUserById(DbPool, userId);
    if (user) {
        next(null, {user_id: userId});
    } else {
        next(new Error(`No User: ${JSON.stringify(jwt_payload)}`), null);
    }
})

const init = (mode: string) => {
    return (passport: any) => {
        if (mode === 'staging' || mode === 'production') {
            const clientID = process.env.GOOGLE_AUTH_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET;
            const host = process.env.SERVER_HOSTNAME;
            const callbackURL = `${host}/auth/google/callback`
            const googleOAuthStrategy = new GoogleStrategy({
                clientID,
                clientSecret,
                callbackURL,
                passReqToCallback: true
            }, async function(request, accessToken, refreshToken, profile, done) {
                const email = profile.emails[0].value;
                const user = await authenticateOAuthUser(DbPool, email);
                request.user = { user_id: user.userId };
                done(null, request.user);
            });
            passport.use('google-oauth', googleOAuthStrategy);
            const googleTokenStrategy = new GoogleTokenStrategy({tokenFromRequest: 'header', passReqToCallback: true}, async (request, email, done) => {
                const user = await authenticateOAuthUser(DbPool, email);
                request.user = user;
                done(null, user, request);
            })
            passport.use('google-token', googleTokenStrategy);
        }
        passport.use('signup', signupStrategy)
        passport.use('login', loginStrategy)
        passport.use('jwt', jwtStrategy)
    }
}

export default init(process.env.NODE_ENV);
