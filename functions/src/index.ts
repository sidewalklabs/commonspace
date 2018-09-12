import *  as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as https from 'https';
import * as nodemailer from 'nodemailer';

import { Location, Study, StudyAccess, Survey, User } from '../../src/datastore';
import { UserRecord } from 'firebase-functions/lib/providers/auth';


const gmailEmail = functions.config().email.email;
const gmailPassword = functions.config().email.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

const serviceAccountKey = functions.config().gcp.serviceaccountkey;
admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) })

function callGcp(host: string, path: string, payload: Location | Study | Survey | StudyAccess | User) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        host,
        path
    };

    return new Promise((resolve, reject) => {
        let returnedData = '';
        const req = https.request(options, (res) => {
            const logObject = {
                url: options.host + path,
                status_code: res.statusCode,
                method: res.method,
                headers: res.headers
            };

            if (res.statusCode !== 200) {
                console.error(logObject);
                reject(new Error(`HTTP Response Code: ${res.statusCode}`));
            }

            res.on('data', (d) => {
                returnedData = returnedData.concat(d);
                process.stdout.write(d);
            });

            res.on('error', (e) => {
                console.error('connection: ', JSON.stringify(options), ' error: ', e);
                reject(e);
            });

            res.on('end', () => {
                resolve(returnedData);
            });
        });
        req.on('error', (e) => {
            console.error('connection: ', JSON.stringify(options));
            console.error('catch error: ', e);
            reject(e);
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

async function saveUserToSqlApi(apiHost: string, userRecord: UserRecord) {
    const user: User = {
        userId: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
    };

    await callGcp(apiHost, '/saveNewUser', user);
    const firestore = admin.firestore();
    firestore.settings({ timestampsInSnapshots: true });
    return await firestore.collection('/users').doc(userRecord.uid).set(user);
}

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const newlyAuthenticatedUser = functions.auth.user().onCreate((user) => saveUserToSqlApi(functions.config().gcp.cloud_functions_url, user));

export async function saveStudyToSqlApi(apiHost: string, study: Study) {
    return await callGcp(apiHost, '/saveNewStudy', study);
}


interface FirestoreStudy extends Study {
    token: string;
    firebaseUserId: string;
};

export const newStudyCreated = functions.firestore.document('/study/{studyId}').onCreate(async (snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    // todo use token and then delete it
    const newStudy = snapshot.data() as FirestoreStudy;
    let decodedToken;
    if (newStudy.token) {
        decodedToken = await admin.auth().verifyIdToken(newStudy.token);
        newStudy.firebaseUserId = decodedToken.uid;
        const doc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
        newStudy.userId = doc.data().userId;
    }
    // todo firebase claims seem unreliable
    // there was an attempt to set a custom claim per study that user's would need to save data points
    if (true || decodedToken.studyCreator) {
        await saveStudyToSqlApi(functions.config().gcp.cloud_functions_url, newStudy);
        const claimKey = snapshot.id.replace(/-/, '_');
        const claim = {};
        claim[claimKey] = true;
        //await admin.auth().setCustomUserClaims(decodedToken.uid, claim);
        delete newStudy.token;

        const firestore = admin.firestore();
        firestore.settings({ timestampsInSnapshots: true });
        return await firestore.collection('/study').doc(snapshot.id).set(newStudy);
    }
    // else {
    //     console.log(`User ${newStudy.firebaseUserId} is not allowed to create studies, must have studyCreator claim`);
    //     await admin.firestore().collection('/study').doc(snapshot.id).delete();
    // }
});

function inviteSurveyorEmail(email: string) {
    const mailOptions: nodemailer.SendMailOptions = {
        from: `Gehl Data Collector <thorncliffeparkpubliclifepilot@gmail.com>`,
        to: email,
        subject: 'Invite to collect survey data for a study',
        text: `Hello! You've been invited to collaborate on a p33p.`
    };

    console.log('attempting to send email: ', JSON.stringify(mailOptions));
    // The user subscribed to the newsletter.
    return mailTransport.sendMail(mailOptions);
}

export const studyUpdated = functions.firestore.document('/study/{studyId}').onUpdate(async ({ after, before }, ctx) => {
    const newValue = after.data();
    const previousValue = before.data();
    const previousSurveyors = previousValue.surveyors ? previousValue.surveyors : [];
    const latestSurveyors = newValue.surveyors ? newValue.surveyors : [];
    const previousUsers = new Set(previousSurveyors);
    const newUsers = latestSurveyors.filter(x => !previousUsers.has(x));
    console.log(`new users: ${JSON.stringify(newUsers)}`);
    return await Promise.all(newUsers.map(async (userEmail) => {
        // todo handle user hasn't used app yet
        const user: UserRecord = await admin.auth().getUserByEmail(userEmail);
        const { studyId } = newValue;
        const studyAccess = {
            studyId,
            userEmail
        }
        //Promise.all(newUsers.map((newSurveyor) => inviteSurveyorEmail(newSurveyor)))
        return await callGcp(functions.config().gcp.cloud_functions_url, '/addSurveyorToStudy', studyAccess)
    }));
})

export const newLocationAdded = functions.firestore.document('/study/{studyId}/location/{locationId}').onCreate(async (snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const location = snapshot.data() as Location;
    return await callGcp(functions.config().gcp.cloud_functions_url, '/saveNewLocation', location);
});

export const newSurveyCreated = functions.firestore.document('/study/{studyId}/survey/{surveyId}').onCreate(async (snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const survey = snapshot.data() as Survey;
    return await callGcp(functions.config().gcp.cloud_functions_url, '/saveNewSurvey', survey)
});

export const addDataPointToSurvey = functions.firestore.document('/study/{studyId}/survey/{surveyId}/dataPoints/{dataPointId}').onCreate(async (snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const dataPoint = snapshot.data();
    const surveyRef = snapshot.ref.parent.parent;
    const surveySnapshot = await surveyRef.get()
    const survey = surveySnapshot.data() as Survey;
    const studySnapshot = await surveyRef.parent.parent.get();
    const study = studySnapshot.data() as Study;
    //await callGcp(functions.config().gcp.cloud_functions_url, ''
});
