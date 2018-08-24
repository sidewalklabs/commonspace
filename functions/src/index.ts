import *  as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as https from 'https';
import * as nodemailer from 'nodemailer';
import * as uuidv4 from 'uuid/v4';

import { Study, StudyAccess, Survey, User } from '../../src/datastore';
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

function callGcp(hostname: string, path: string, payload: User | Study | StudyAccess) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        hostname,
        path
    };
    return new Promise((resolve, reject) => {
        let returnedData = '';
        const req = https.request(options, (res) => {
            const logObject = {
                url: res.url,
                status_code: res.statusCode,
                method: res.method,
                headers: res.headers
            };
            console.log(JSON.stringify(logObject));
            if (res.statusCode !== 200) {
                console.error('Error for payload: ', JSON.stringify(payload));
            }

            res.on('data', (d) => {
                returnedData = returnedData.concat(d);
                process.stdout.write(d);
            });

            res.on('error', (e) => {
                console.error(e);
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
    })


}

async function saveUserToSqlApi(apiHost: string, userRecord: UserRecord) {
    const user: User = {
        userId: uuidv4(),
        email: userRecord.email,
        name: userRecord.displayName
    };

    await callGcp(apiHost, '/saveNewUser', user);
    await admin.firestore().collection('/users').doc(userRecord.uid).set(user);
}

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const newlyAuthenticatedUser = functions.auth.user().onCreate((user) => saveUserToSqlApi(functions.config().gcp.cloud_functions_url, user));

export async function saveStudyToSqlApi(apiHost: string, study: Study) {
    study.studyId = uuidv4();
    await callGcp(apiHost, '/saveNewStudy', study);
    return study;
}


interface FirestoreStudy extends Study {
    token: string;
    firebaseUserId: string;
};

export const newStudyCreated = functions.firestore.document('/study/{studyId}').onCreate(async (snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    // todo use token and then delete it
    const newStudy = snapshot.data() as FirestoreStudy;
    const decodedToken = await admin.auth().verifyIdToken(newStudy.token);
    newStudy.firebaseUserId = decodedToken.uid;
    const doc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    newStudy.userId = doc.data().userId;
    // todo firebase claims seem unreliable
    if (true || decodedToken.studyCreator) {
        const { studyId } = await saveStudyToSqlApi(functions.config().gcp.cloud_functions_url, newStudy);
        newStudy.studyId = studyId;
        const claimKey = snapshot.id.replace(/-/, '_');
        const claim = {};
        claim[claimKey] = true;
        //await admin.auth().setCustomUserClaims(decodedToken.uid, claim);
        delete newStudy.token;
        await admin.firestore().collection('/study').doc(snapshot.id).set(newStudy);
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

function authorizeNewSurveyorAndEmail(latestSurveyors: string[], previousSurveyors: string[]) {
    const previousUsers = new Set(previousSurveyors);
    if (latestSurveyors && previousSurveyors) {
        const newUsers = latestSurveyors.filter(x => !previousUsers.has(x));
        if (newUsers.length) {
            newUsers.map((newSurveyor) => inviteSurveyorEmail(newSurveyor));
            return newUsers;
        }
    }
    return [];
}

export const studyUpdated = functions.firestore.document('/study/{studyId}').onUpdate(({ after, before }, ctx) => {
    const newValue = after.data();
    const previousValue = before.data();
    const newUsers = authorizeNewSurveyorAndEmail(previousValue.surveyors as string[], newValue.surveyors as string[]);
    newUsers.forEach(async (userEmail) => {
        // todo handle user hasn't used app yet
        try {
            const user: UserRecord = await admin.auth().getUserByEmail(userEmail);
            const { studyId } = newValue;
            console.log(JSON.stringify(user));
            const studyAccess = {
                studyId,
                userEmail
            }
            await callGcp(functions.config().gcp.cloud_functions_url, 'addSurveyorToStudy', studyAccess)
        } catch (e) {
            console.error('try to get new user for email: ', e);
        }
    })
})


export const newSurveyCreated = functions.firestore.document('/study/{studyId}/survey/{surveyId}').onCreate(async (snapshot: FirebaseFirestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const survey = snapshot.data() as Survey;
    console.log('survey: ', survey);
})
