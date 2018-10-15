import * as babelPolyfill from 'babel-polyfill';

import camelcaseKeys from 'camelcase-keys';
import { observable, autorun, toJS, get, set } from 'mobx';
import snakecaseKeys from 'snakecase-keys';

import { AUTH, FIRESTORE } from '../web.config';

import { groupArrayOfObjectsBy } from '../utils';


interface ApplicationState {
    currentSurvey: null | string;
    studies: any;
}

async function fetchSurveysForStudy(studyId: string) {
    const study = applicationState.studies[studyId];
    if (!study.surveys) {
        const surveysReq = await fetch(`http://localhost:3000/studies/${studyId}/surveys`);
        const surveysAsArr = camelcaseKeys(await surveysReq.json());
        study.surveys = groupArrayOfObjectsBy(surveysAsArr, 'surveyId');
    }
    return study;
}

export async function getStudies() {
    const studiesReq = await fetch('http://localhost:3000/studies');
    const studies = camelcaseKeys(await studiesReq.json());
    applicationState.studies = groupArrayOfObjectsBy(studies, 'studyId');
}

export async function persistStudy(studyId) {
    const surveys = Object.values(toJS(applicationState.currentStudy.surveys))
    const data = toJS(applicationState.currentStudy);
    data.surveys = surveys;
    const response = await fetch(`/studies/${studyId}`, {
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(snakecaseKeys(data)), // body data type must match "Content-Type" header
    });
    console.log(response.status);
}

export async function selectNewStudy(study: any) {
    applicationState.currentStudy = await fetchSurveysForStudy(study.studyId);
}

const applicationState = observable({
    currentStudy: null,
    studies: {}
});

export default applicationState;
