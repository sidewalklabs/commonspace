import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const pg = require('pg');
import * as uuidv4 from 'uuid/v4';

import { insertUser, User } from '../../src/datastore';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// @ts-ignore: global variable
const host = 'host';
// @ts-ignore: global variable
const dbUser = functions.config().pg.db_user;
// @ts-ignore: global variable
const dbPass = functions.config().pg.db_pass;
// @ts-ignore: global variable
const dbName = functions.config().pg.db_name;

const pool = new pg.Pool({
    max: 1,
    host: host,
    user: dbUser,
    password: dbPass,
    database: dbName
});

export const newlyAuthenticatedUser = functions.auth.user().onCreate((user: admin.auth.UserRecord) => {
    const sqlUser: User = {
        user_id: uuidv4(),
        email: user.email,
        name: user.displayName
    };
    console.log(`new user-id: ${sqlUser.user_id}, email: ${sqlUser.email}, name: ${sqlUser.name}`)
    insertUser(pool, sqlUser).then(res => {
        console.log(`successfully added user: ${sqlUser} to sql database`);
    }).catch(err => {
        console.error(err)
    });
})
