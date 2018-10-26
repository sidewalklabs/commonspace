import * as jwt from 'jsonwebtoken';
import  * as passport from 'passport';
import * as passportJWT from 'passport-jwt'
import * as passportLocal from 'passport-local';
import * as uuidv4 from 'uuid/v4';

const LocalStrategy = passportLocal.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy  = passportJWT.Strategy;


import DbPool from './database';
import { createUser, findUser, User } from './datastore';

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
}

const loginStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
    console.log('payload received', jwt_payload);
  // usually this would be a database call:
    const user =  await findUser(DbPool, 'b44a8bc3-b136-428e-bee5-32837aee9ca2') ;
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

export default function init(passport) {
    //passport.initialize();
    passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
				const userId = uuidv4()
				const user = {email, password, userId, name: '' }
        try {
            await createUser(DbPool, user);
	    console.log(JSON.stringify(user));
            return done(null, {id: userId, ...user});
        } catch (err) {
            return done(err, null);
        }
    }))

    //passport.use('login', loginStrategy);
}
