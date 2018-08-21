import * as functions from 'firebase-functions';
import * as https from 'https';
import * as nodemailer from 'nodemailer';
import * as uuidv4 from 'uuid/v4';


import { Study, User } from '../../src/datastore';


const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

function callGcp(host: string, path: string, payload: User | Study) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        host,
        path
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

    req.write(JSON.stringify(payload));
    req.end();

}

function saveUserToSqlApi(apiHost: string, userRecord: { email: string, displayName: string }) {
    const user: User = {
        userId: uuidv4(),
        email: userRecord.email,
        name: userRecord.displayName
    };

    callGcp(apiHost, '/saveNewUser', user);
}

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const newlyAuthenticatedUser = functions.auth.user().onCreate((user) => saveUserToSqlApi(functions.config().gcp.url, user));

function saveStudyToSqlApi(apiHost: string, study: Study) {
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
    newStudy.studyId = uuidv4();
    saveStudyToSqlApi(functions.config().gcp.cloud_functions_url, {
        userId: 'f1f8fdb1-dbdc-4f44-99d3-44695df74fee',
        ...newStudy
    })
});

export const studyUpdated = functions.firestore.document('/study/{studyId}').onUpdate((change, ctx) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const previousUsers = new Set(previousValue.surveyors);
    const newUsers = newValue.surveyors.filter(x => !previousUsers.has(x));
    newUsers.forEach(newSurveyor => {
        console.log(' new users added to survey: ', newSurveyor);
    });
});

export function inviteSurveyor(email: string) {
    const mailOptions: nodemailer.SendMailOptions = {
        from: `Gehl Data Collector <thorncliffeparkpubliclifepilot@gmail.com>`,
        to: email,
        subject: 'Invite to collect survey data for a study',
        text: `Hello! You've been invited to collaborate on a p33p.`
    };

    // The user subscribed to the newsletter.
    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('mail sent!')
    })
}
