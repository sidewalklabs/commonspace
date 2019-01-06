import * as jwt from 'jsonwebtoken';
import * as passport from 'passport';
import * as passportGoogle from 'passport-google-oauth20';
import * as passportJWT from 'passport-jwt'
import * as passportLocal from 'passport-local';
import GoogleTokenStrategy from './passport_strategies/GoogleTokenStrategy';
import path from 'path';
import * as uuid from 'uuid';

import { authenticateOAuthUser, createUser, findUser, findUserById, User } from './datastore/user';
import DbPool from './database';

import dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_DIR ? path.join(process.env.DOTENV_CONFIG_DIR, '.env'): ''});

const LocalStrategy = passportLocal.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const GoogleStrategy = passportGoogle.Strategy;
const JwtStrategy  = passportJWT.Strategy;

const signinStrategy = new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    //@ts-ignore
    const userId = uuid.v4();
    const user = {email, password, userId, name: '' };
        try {
            await createUser(DbPool, user);
            return done(null, {user_id: userId});
        } catch (err) {
            return done(err, null);
        }
    })

const loginStrategy = new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    try {
        const user = await findUser(DbPool, email, password);
        return done(null, {user_id: user.user_id});
    } catch (err) {
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
        next(null, false);
    }
});

const init = (mode: string) => {
    return (passport: any) => {
        if (mode == 'staging' || mode === 'production') {
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
        passport.use('signin', signinStrategy)
        passport.use('login', loginStrategy)
        passport.use('jwt', jwtStrategy)
    }
}

export default init(process.env.NODE_ENV);
