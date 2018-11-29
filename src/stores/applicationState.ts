import camelcaseKeys from 'camelcase-keys';
import { observable, autorun, toJS, get, set } from 'mobx';
import moment from 'moment';
import uuid from 'uuid';

import { AUTH, FIRESTORE } from '../web.config';

import { groupArrayOfObjectsBy } from '../utils';
import { surveysForStudy } from '../datastore';
import { FeatureCollection } from 'geojson';

import {  snakecasePayload } from '../utils';

export interface Study {
    studyId: string;
    protocolVersion: string;
    surveys: {[key: string]: any};
    surveyors: string[];
    title: string;
    map: FeatureCollection;
}

export interface ApplicationState {
    currentStudy: null | Study;
    studies: {[key: string]: Study};
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
    return fetch(process.env.server_hostname + route, {
        ...fetchParams,
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `bearer ${token}`
        }
    })
}

function putToApi(route: string, token: string, data: any) {
    const body = JSON.stringify(snakecasePayload(data))
    return fetch(process.env.server_hostname + route, {
        ...fetchParams,
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `bearer ${token}`
        },
        body // body data type must match "Content-Type" header
    })
}

async function postToApi(route: string, token: string, data: any) {
    const body = JSON.stringify(snakecasePayload(data));
    try {
        return await fetch(process.env.server_hostname + route, {
            ...fetchParams,
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `bearer ${token}`
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            body // body data type must match "Content-Type" header
        })
    } catch (err) {
        console.log(`[uri ${route}] [data ${JSON.stringify(data)}] ${err}`)
        throw err;
    }
}

async function fetchSurveysForStudy(token: string, studyId: string) {
    const study = applicationState.studies[studyId];
    if (!study.surveys) {
        const surveysReq = await getFromApi(`/api/studies/${studyId}/surveys`, token);
        const surveysAsArr = camelcaseKeys(await surveysReq.json());
        study.surveys = groupArrayOfObjectsBy(surveysAsArr, 'surveyId');
    }
    return study;
}

export async function getStudies(token: string) {
    const studiesReq = await getFromApi('/api/studies?type=admin', token);
    const studies = camelcaseKeys(await studiesReq.json());
    return groupArrayOfObjectsBy(studies, 'studyId');
}

export async function updateStudy(studyInput) {
    const studyId = applicationState.currentStudy.studyId;
    const surveys = Object.values(toJS(studyInput.surveys))
    const study = toJS(applicationState.currentStudy);
    study.surveys = surveys;
    const { token } = applicationState;
    const response = await putToApi(`/api/studies/${studyId}`, token, study);
    console.log(response.status);
}

export async function saveNewStudy(studyInput: Study) {
    const study: Study = toJS(studyInput)
    study.surveys = Object.values(toJS(studyInput.surveys));
    const { token } = applicationState;
    const response = await postToApi(`/api/studies`, token, study);
    console.log(response.status);
}

export async function selectNewStudy(study: any) {
    const { token } = applicationState;
    applicationState.currentStudy = await fetchSurveysForStudy(token, study.studyId);
}

export async function setCurrentStudyEmptySkeleton() {
    const studyId =  uuid.v4()
    applicationState.studies[studyId] = {
        studyId,
        title: '',
        protocolVersion: '1.0',
        surveys: {},
        surveyors: [],
        map: {
            type: 'FeatureCollection',
            features: []
        }
    }
    applicationState.currentStudy = applicationState.studies[studyId];
}

export async function addNewSurveyToCurrentStudy() {
    const newSurveyId = uuid.v4()
    applicationState.currentStudy.surveys[newSurveyId] = {
        surveyId: newSurveyId,
        startDate: moment().toISOString(),
        endDate: moment().add(1, 'hours').toISOString(),
        surveyorEmail: '',
        locationId: ''
    }
}

export async function addNewSurveyorToSurvey(studyId: string, email: string) {
    const { token } = applicationState;
    applicationState.currentStudy.surveyors.push(email);
    //const response = await postToApi(`/api/v1/studies/${studyId}/surveyors`, token, {email})
    //console.log(response.status);
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
    console.log(toJS(applicationState.currentStudy));
});

export default applicationState;
