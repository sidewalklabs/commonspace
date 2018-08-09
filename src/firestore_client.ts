import { firestore } from 'firebase';

import { Study, Survey } from './datastore';


export function saveStudy(db: firestore.Firestore, study: Study) {
    // create new study
    db.collection('study').add({
        ...study
    }).then(function(docRef) {
        const study_id = docRef.id;
        console.log("Document written with ID: ", docRef.id);
    }).catch(function(error) {
        console.error("Error adding document: ", error);
    });
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
