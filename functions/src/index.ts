import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const pg = require('pg');
import * as uuidv4 from 'uuid/v4';
import * as https from 'https';


import { createStudy, createUser, Study, User } from '../../src/datastore';


async function saveUserToSqlApi(apiHost: string, userRecord: { email: string, displayName: string }) {
    const user: User = {
        userId: uuidv4(),
        email: userRecord.email,
        name: userRecord.displayName
    };
    const options = {
        host: apiHost,
        path: "/saveNewUser",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    };
    const req = https.request(options, (res) => {
        const logObject = {
            url: res.url,
            status_code: res.statusCode,
            method: res.method,
            headers: res.headers
        };
        console.log(JSON.stringify(logObject));

        res.on('data', (d) => {
            process.stdout.write(d);
        });

    });
    req.on('error', (e) => {
        console.error('catch error: ', e);
    });

    req.write(JSON.stringify(user));
    req.end();
}

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const newlyAuthenticatedUser = functions.auth.user().onCreate((user) => saveUserToSqlApi(functions.config().pg.url, user));

export const newStudyCreated = functions.firestore.document('/study/{studyId}').onCreate((snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const newStudy = snapshot.data() as Study;
    // createStudy(pool, newStudy, ['gender', 'location']).then(res => {
    //     console.log(`successfully added study: ${newStudy} to sql database`);
    // }).catch(err => {
    //     console.error(err)
    // });
});
