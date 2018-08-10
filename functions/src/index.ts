import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const pg = require('pg');
import * as uuidv4 from 'uuid/v4';

import { createStudy, createUser, Study, User } from '../../src/datastore';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// @ts-ignore: global variable
// firebase environment vars are different than cloud function variables
let pgConnectionInfo;
if (process.env && process.env.NODE_ENV === 'cloud-function-production') {
    pgConnectionInfo = {
        connectionLimit: 1,
        host: process.env.db_host,
        user: process.env.db_user,
        password: process.env.db_pass,
        database: process.env.db_name
    }
} else {
    pgConnectionInfo = {
        connectionLimit: 1,
        host: functions.config().pg.db_host,
        user: functions.config().pg.db_user,
        password: functions.config().pg.db_pass,
        database: functions.config().pg.db_name
    }
}

const pool = new pg.Pool(pgConnectionInfo);

export const newlyAuthenticatedUser = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
    const sqlUser: User = {
        userId: uuidv4(),
        email: user.email,
        name: user.displayName
    };
    // make http request to cloud function to save to postgresql
})


// }


export const newStudyCreated = functions.firestore.document('/study/{studyId}').onCreate((snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const newStudy = snapshot.data() as Study;
    createStudy(pool, newStudy, ['gender', 'location']).then(res => {
        console.log(`successfully added study: ${newStudy} to sql database`);
    }).catch(err => {
        console.error(err)
    });
});

export async function newUserSaveToPostgres(request, response) {
    const user = request.body as User;
    const sqlUser: User = {
        userId: uuidv4(),
        email: user.email,
        name: user.name
    };
    console.log(`new user-id: ${sqlUser.userId}, email: ${sqlUser.email}, name: ${sqlUser.name}`)
    console.log(`password: ${pgConnectionInfo.password}`);
    console.log(`user: ${pgConnectionInfo.user}`);
    console.log(`database: ${pgConnectionInfo.database}`);
    const result = await pool.query('SELECT NOW() as now');
    console.log(`result: ${result}`);
    const userInsertResult = await createUser(pool, sqlUser);
    return result;
}
