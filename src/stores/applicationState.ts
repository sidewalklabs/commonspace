import * as babelPolyfill from 'babel-polyfill';

import camelcaseKeys from 'camelcase-keys';
import { observable, autorun, toJS, get, set } from 'mobx';
import snakecaseKeys from 'snakecase-keys';
import uuidv4 from 'uuid/v4';

import { AUTH, FIRESTORE } from '../web.config';

import { groupArrayOfObjectsBy } from '../utils';


interface Study {
    protocolVersion: string;
    surveys: {[key: string]: any};
    surveyors: string[]; 
    title: string;
}

interface ApplicationState {
    currentStudy: null | Study;
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

export async function updateStudy(studyId) {
    const surveys = Object.values(toJS(applicationState.currentStudy.surveys))
    const data = toJS(applicationState.currentStudy);
    data.surveys = surveys; // TODO is this really necessary?
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

export async function createStudy(studyId) {
    const surveys = Object.values(toJS(applicationState.currentStudy.surveys))
    const data = toJS(applicationState.currentStudy);
    data.surveys = surveys; // TODO is this really necessary?
    const response = await fetch(`/studies/${studyId}`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
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

export async function setCurrentStudyEmptySkeleton() {
    applicationState.currentStudy = {
        studyId: uuidv4(),
        title: '',
        protocolVersion: '1.0',
        surveys: {},
        surveyors: []
    }
}

export async function addNewSurveyToCurrentStudy() {
    const newSurveyId = uuidv4() 
    applicationState.currentStudy.surveys[newSurveyId] = {
        surveyId: newSurveyId
    }
}

export async function addNewSurveyorToSurvey(studyId: string, email: string) {
    const data = { email }
    const response = await fetch(`/studies/${studyId}/surveyors`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
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
    })
    console.log(response.status);
}

const applicationState = observable({
    currentStudy: null,
    studies: {}
});

autorun(() => {
    console.log(toJS(applicationState.currentStudy));
});

export default applicationState;
