import { auth, firestore } from 'firebase';

import { Study, Survey } from './datastore';


export async function saveStudy(auth: firebase.auth.Auth, db: firestore.Firestore, study: Study) {
    // create new study
    const token = await auth.currentUser.getIdToken(true);
    const studyWithToken: Study & { token: string } = {
        token,
        ...study
    }
    const docRef = await db.collection('study').add(studyWithToken);
    const firebaseId = docRef.id;
    return [studyWithToken, firebaseId];
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

/**
 * we need to separately add the survey location, for the prototype we only need one location.
 */
export function saveSurvey(db: firestore.Firestore, study: Study, location: Location, survey: Survey) {
    db.collection('study')
        .doc(study.studyId)
        .collection('survey')
        .add({
            ...survey
        }).then(function(surveyRef: any) {
            surveyRef.collection('location').add({
                ...location
            });
        }).catch(function(error: any) {
            console.error("Error adding document: ", error);
        });
}
