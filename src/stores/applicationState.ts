import * as babelPolyfill from 'babel-polyfill';

import { observable, autorun, toJS, get, set } from 'mobx';

import { AUTH, FIRESTORE } from '../web.config';
import {
    getStudiesWhereAdminForUser,
    getSurveysForStudy
} from '../firestore-client';
import { groupArrayOfObjectsBy } from '../utils';

interface Survey { }

interface ApplicationState {
    currentSurvey: null | string;
    studies: any;
}

async function fetchSurveysForStudy(studyId: string) {
    const study = applicationState.studies[studyId];
    if (!study.surveys) {
        const surveysAsArr = await getSurveysForStudy(FIRESTORE, studyId);
        study.surveys = groupArrayOfObjectsBy(surveysAsArr, 'surveyId');
    }
    return study;
}

export async function getStudies() {
    const studies = await getStudiesWhereAdminForUser(
        FIRESTORE,
        AUTH.currentUser.uid
    );
    applicationState.studies = groupArrayOfObjectsBy(studies, 'studyId');
}

export async function selectNewStudy(study: any) {
    applicationState.currentStudy = await fetchSurveysForStudy(study.studyId);
}

const applicationState = observable({
    currentStudy: null,
    studies: {}
});

export default applicationState;
