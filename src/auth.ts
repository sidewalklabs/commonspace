import * as jwt from 'jsonwebtoken';
import  * as passport from 'passport';
import * as passportJWT from 'passport-jwt'
import * as passportLocal from 'passport-local';
import * as uuidv4 from 'uuid/v4';

const LocalStrategy = passportLocal.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy  = passportJWT.Strategy;


import DbPool from './database';
import { createUser, findUser, findUserById, User } from './datastore';

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
}

const signinStrategy = new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
				const userId = uuidv4()
				const user = {email, password, userId, name: '' }
        try {
            await createUser(DbPool, user);
	    console.log(JSON.stringify(user));
            return done(null, {user_id: userId});
        } catch (err) {
            return done(err, null);
        }
    })

const loginStrategy = new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
        try {
            const user = await findUser(DbPool, email, password);
	    console.log(JSON.stringify(user));
            return done(null, {user_id: user.user_id});
        } catch (err) {
            return done(err, null);
        }
    })

const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
    console.log('payload received', jwt_payload);
    const {user_id: userId} = jwt_payload;
  // usually this would be a database call:
    const user =  await findUserById(DbPool, 'b44a8bc3-b136-428e-bee5-32837aee9ca2');
    if (user) {
        next(null, {user_id: userId});
    } else {
        next(null, false);
    }
});

export default function init(passport) {
    //passport.initialize();
    passport.use('signin', signinStrategy)

    passport.use('login', loginStrategy);

    passport.use('jwt', jwtStrategy);
}
