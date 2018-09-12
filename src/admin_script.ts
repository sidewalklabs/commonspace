import { readFileSync } from 'fs';

import * as admin from 'firebase-admin';
import { addUserToStudyByEmail, saveStudy } from './firestore-client';

const adminUserId = "b44a8bc3-b136-428e-bee5-32837aee9ca2"
const adminEmail = "sebastian@sidewalklabs.com"

const studyId = "42eac5cb-0885-40a4-8010-16fb5246d8c8"
const surveyId = "17f32eae-01c5-463c-aabf-686de95607bf"
const zoneOneId = "d0b35a03-0c0e-4748-8077-76c199c45a11"
const zoneTwoId = "0e7d276e-b85b-48e4-9df3-0cd0cf4db50f"
const zoneThreeId = "07ab155a-2b38-44a7-ad73-b6711b3d46b9"

const dataCollectorId = "7566b7ca-0372-46c6-9d2c-0e9fb38bebfb"
const dataCollectorEmail = "thorncliffeparkpubliclifepilot@gmail.com"

const adminUser = {
    "uid": adminUserId,
    "email": adminEmail,
    "name": "Seabreezy"
}

const dataCollectorUser = {
    "uid": dataCollectorId,
    "email": dataCollectorEmail,
    "name": "Thorncliffe park data colllector"
}

const newStudy = {
    "userId": adminUserId,
    "title": "Stationary Counts RV Burgess",
    "protocolVersion": "1.0",
    "studyId": studyId,
    "locations": [
        {
            "locationId": zoneOneId,
            "country": "canada",
            "city": "Toronto",
            "namePrimary": "Zone 1",
            "subdivision": "center",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        -79.34424608945848,
                        43.703880389068935
                    ],
                    [
                        -79.34380352497102,
                        43.70413633962324
                    ],
                    [
                        -79.34372305870058,
                        43.70430697271902
                    ],
                    [
                        -79.34361040592194,
                        43.70422941228114
                    ],
                    [
                        -79.34343338012695,
                        43.70400254742435
                    ],
                    [
                        -79.34339582920076,
                        43.70387263297447
                    ],
                    [
                        -79.34339851140977,
                        43.7037543524096
                    ],
                    [
                        -79.34351652860641,
                        43.7036457667675
                    ],
                    [
                        -79.34357017278673,
                        43.70355851030545
                    ],
                    [
                        -79.3438544869423,
                        43.703581778707765
                    ],
                    [
                        -79.34403955936433,
                        43.70363219354842
                    ]
                ]
            }
        },
        {
            "locationId": zoneTwoId,
            "locationCountry": "canada",
            "locationCity": "Toronto",
            "locationNamePrimary": "Zone 2",
            "locationSubdivision": "east",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        -79.34425145387651,
                        43.7038842671158
                    ],
                    [
                        -79.34380620718004,
                        43.704142156668595
                    ],
                    [
                        -79.34371769428255,
                        43.70432054578531
                    ],
                    [
                        -79.34359699487688,
                        43.70421777820681
                    ],
                    [
                        -79.34341728687288,
                        43.70398703526603
                    ],
                    [
                        -79.34339314699174,
                        43.70384160858659
                    ],
                    [
                        -79.34338778257371,
                        43.70374465727096
                    ],
                    [
                        -79.34351384639741,
                        43.703643827736386
                    ],
                    [
                        -79.34355944395067,
                        43.70355269320345
                    ],
                    [
                        -79.34322416782379,
                        43.70355269320345
                    ],
                    [
                        -79.34305518865587,
                        43.70348094889923
                    ],
                    [
                        -79.34261798858644,
                        43.70388232809239
                    ],
                    [
                        -79.34361040592194,
                        43.70445627627938
                    ],
                    [
                        -79.34435606002809,
                        43.7039715231037
                    ]
                ]
            }
        },
        {
            "locationId": zoneThreeId,
            "locationCountry": "canada",
            "locationCity": "Toronto",
            "locationNamePrimary": "Zone 3",
            "locationSubdivision": "west",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        -79.34435606002809,
                        43.70395407191628
                    ],
                    [
                        -79.34425145387651,
                        43.70387845004543
                    ],
                    [
                        -79.34404492378236,
                        43.70362637645357
                    ],
                    [
                        -79.3438357114792,
                        43.70356820547418
                    ],
                    [
                        -79.34322685003282,
                        43.703548815135164
                    ],
                    [
                        -79.34306591749193,
                        43.70346931467964
                    ],
                    [
                        -79.3434950709343,
                        43.70313967751972
                    ],
                    [
                        -79.34463769197465,
                        43.70377955976265
                    ]
                ]
            }
        }
    ]
}
const addEmailToSurvey = {
    "userEmail": dataCollectorEmail,
    "studyId": studyId
}

const newSurvey = {
    "studyId": studyId,
    "locationId": zoneTwoId,
    "surveyId": surveyId,
    "startDate": "2018-09-14T17:00:00Z",
    "endDate": "2018-09-14T19:00:00Z",
    "representation": "absolute",
    "method": "analog",
    "userId": dataCollectorId,
}

async function deleteUserByEmailOkayIfNotExists(email: string) {
    try {
        const { uid } = await admin.auth().getUserByEmail(email);
        await admin.auth().deleteUser(uid);
    } catch (error) {
        console.log(`no existing user found for email ${email}`);
    }
    return;
}

async function deleteInFirestoreIfExists(ref: FirebaseFirestore.DocumentReference) {
    const docSnapshot = await ref.get();
    if (docSnapshot.exists) {
        await ref.delete();
    }
}

async function setupBackend() {
    await deleteUserByEmailOkayIfNotExists(adminUser.email);
    await deleteUserByEmailOkayIfNotExists(dataCollectorUser.email);
    await admin.auth().createUser(adminUser);
    await admin.auth().createUser(dataCollectorUser);

    const studyRef = await firestore.collection('study').doc(newStudy.studyId);
    await deleteInFirestoreIfExists(studyRef);
    try {
        // @ts-ignore
        await saveStudy(firestore, newStudy);
        console.log(`new study in firebase: ${newStudy.studyId}`);
    } catch (error) {
        console.log('error: ', error);
        throw error;
    }

    try {
        // @ts-ignore
        await addUserToStudyByEmail(firestore, newStudy.studyId, dataCollectorEmail);
    } catch (error) {
        console.error(error);
    }

    const surveyRef = await studyRef.collection('survey').doc(newSurvey.surveyId);
    await deleteInFirestoreIfExists(surveyRef);
    try {
        // @ts-ignore
        await surveyRef.set(newSurvey);
        console.log(`new survey in firebase: ${newSurvey.surveyId}`);
    } catch (error) {
        console.log('error: ', error);
        throw error;
    }
    return;
}

const serviceAccountKey = JSON.parse(readFileSync(process.argv[2], 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) })
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });

setupBackend().then(() => {
    console.log('done');
    process.exit(0);
});
