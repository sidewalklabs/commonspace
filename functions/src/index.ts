import * as functions from 'firebase-functions';
import * as uuidv4 from 'uuid/v4';
import * as https from 'https';


import { Study, User } from '../../src/datastore';


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

async function saveStudyToSqlApi(apiHost: string, study: Study) {
    const options = {
        host: apiHost,
        path: "/saveNewStudy",
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

    console.log('sending payload: ', JSON.stringify({
        ...study
    }));
    req.write(JSON.stringify(study));
    req.end();

}

export const newStudyCreated = functions.firestore.document('/study/{studyId}').onCreate((snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const newStudy = snapshot.data() as Study;
    saveStudyToSqlApi(functions.config().pg.url, {
        studyId: uuidv4(),
        userId: 'f1f8fdb1-dbdc-4f44-99d3-44695df74fee',
        ...newStudy
    }).then(result => {
        console.log('saved new study to gcp: ', result);
    }).catch(err => console.error(err));
});

export function inviteSurveyor(email: string) {
    const mailOptions = {
        from: `Gehl Data Collector <noreply@firebase.com>`,
        to: email
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = `Invite to Survey`;
    mailOptions.text = `Hello! You've been invited to collaborate on a service.`;
    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('mail sent!')
    })
}
