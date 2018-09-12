import { auth, firestore } from 'firebase';
import * as uuid from 'uuid';

import { Location, Study, Survey } from './datastore';


export async function saveStudyWithToken(auth: firebase.auth.Auth, db: firestore.Firestore, study: Study) {
    // create new study
    const token = await auth.currentUser.getIdToken(true);
    const studyWithToken: Study & { token: string } = {
        token,
        ...study
    }
    const docRef = await db.collection('study').doc(study.studyId).set(studyWithToken);
    return study.studyId;
}

export interface FirestoreStudy extends Study {
    locations: Location[];
}

export async function saveStudy(db: firestore.Firestore, study: FirestoreStudy) {
    // create new study
    const { locations } = study;
    delete study.locations;
    const docRef = db.collection('study').doc(study.studyId);
    await docRef.set(study);
    await Promise.all(locations.map((location) => {
        try {
            const { geometry } = location;
            const { coordinates } = geometry;
            // @ts-ignore
            geometry.coordinates = JSON.stringify(coordinates);
            const locationRef = docRef.collection('location').doc(location.locationId);
            return locationRef.set(location);
        } catch (error) {
            console.error(error);
        }
    }));
}

export async function getAvailableStudiesForUserId(db: firestore.Firestore, userId: string) {
    const querySnapshot = await db.collection('study')
        .where("firebaseUserId", "==", userId)
        .get();
    const studies = [];
    querySnapshot.forEach(function(doc) {
        const { title } = doc.data();
        studies.push({
            studyId: doc.id,
            title
        });
    })
    return studies;
}


export async function addUserToStudyByEmail(db: firestore.Firestore, studyId: string, email: string) {
    try {
        const studyRef = db.collection('study').doc(studyId);
        const doc = await studyRef.get();
        if (doc.exists) {
            const currentData = doc.data();
            currentData.surveyors = currentData.surveyors ? currentData.surveyors : [];
            currentData.surveyors.push(email);
            console.log(currentData);
            await studyRef.set(currentData);
        }

    } catch (error) {
        console.error(`failure to save surveyor "${email}" to study with id: ${studyId}, error: ${error}`);
    }
}

/**
 * we need to separately add the survey location, for the prototype we only need one location.
 */
export function saveSurvey(db: firestore.Firestore, study: Study, survey: Survey) {
    try {
        return db.collection('study')
            .doc(study.studyId)
            .collection('survey')
            .doc(survey.surveyId)
            .set(survey)
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}
