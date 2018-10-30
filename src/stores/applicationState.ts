import * as babelPolyfill from 'babel-polyfill';

import camelcaseKeys from 'camelcase-keys';
import { observable, autorun, toJS, get, set } from 'mobx';
import snakecaseKeys from 'snakecase-keys';
import uuidv4 from 'uuid/v4';

import { AUTH, FIRESTORE } from '../web.config';

import { groupArrayOfObjectsBy } from '../utils';


interface Study {
		studyId: string;
    protocolVersion: string;
    surveys: {[key: string]: any};
    surveyors: string[];
    title: string;
}

interface ApplicationState {
    currentStudy: null | Study;
    studies: any;
    token: string;
}

const fetchParams = {
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
}

function getFromApi(route: string, token: string) {
    const {mode, cache, credentials, redirect, referrer} = fetchParams;
    return fetch('http://localhost:3000' + route, {
        ...fetchParams,
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `bearer ${token}`
        }
    })
}

function putToApi(route: string, token: string, data: any) {
    return fetch(route, {
        ...fetchParams,
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `bearer ${token}`
        },
        body: JSON.stringify(snakecaseKeys(data)), // body data type must match "Content-Type" header
    })
}

function postToApi(route: string, token: string, data: any) {
    return fetch(route, {
        ...fetchParams,
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(snakecaseKeys(data)), // body data type must match "Content-Type" header
    })
}

async function fetchSurveysForStudy(token: string, studyId: string) {
    const study = applicationState.studies[studyId];
    if (!study.surveys) {
        const surveysReq = await getFromApi(`/api/v1/studies/${studyId}/surveys`, token);
        const surveysAsArr = camelcaseKeys(await surveysReq.json());
        study.surveys = groupArrayOfObjectsBy(surveysAsArr, 'surveyId');
    }
    return study;
}

export async function getStudies(token: string) {
    const studiesReq = await getFromApi('/api/v1/studies', token);
    const studies = camelcaseKeys(await studiesReq.json());
    return groupArrayOfObjectsBy(studies, 'studyId');
}

export async function updateStudy(studyId: string, token: string) {
    const surveys = Object.values(toJS(applicationState.currentStudy.surveys))
    const study = toJS(applicationState.currentStudy);
    study.surveys = surveys; // TODO is this really necessary?
    const response = await putToApi(`/api/v1/studies/${studyId}`, token, study)
    console.log(response.status);
}

export async function createStudy(studyId, token: string) {
    const surveys = Object.values(toJS(applicationState.currentStudy.surveys))
    const study = toJS(applicationState.currentStudy);
    study.surveys = surveys;
    const response = await postToApi(`/api/v1/studies/${studyId}`, token, study);
    console.log(response.status);
}

export async function selectNewStudy(study: any) {
    const { token } = applicationState;
    applicationState.currentStudy = await fetchSurveysForStudy(token, study.studyId);
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

export async function addNewSurveyorToSurvey(token: string, studyId: string, email: string) {
    const response = await postToApi(`/api/v1/studies/${studyId}/surveyors`, token, {email})
    console.log(response.status);
}

export async function addNewSurveyorToNewSurvey(token: string, email: string) {
    
}

export async function init(token) {
    applicationState.token = token;
    applicationState.studies = await getStudies(token);
}

let applicationState: ApplicationState = observable({
    currentStudy: null,
    studies: {},
    token: null
});

autorun(() => {
    console.log(toJS(applicationState.token));
});

export default applicationState;
