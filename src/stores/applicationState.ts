import camelcaseKeys from 'camelcase-keys';
import { observable, autorun, toJS, get, set } from 'mobx';
import moment from 'moment';
import uuid from 'uuid';

import { groupArrayOfObjectsBy, getEnvVariableRetry } from '../utils';
import { StudyField } from '../datastore/utils';
import { surveysForStudy } from '../datastore/study';
import { FeatureCollection } from 'geojson';

import {  snakecasePayload } from '../utils';

export interface Study {
    studyId: string;
    protocolVersion: string;
    surveys: {[key: string]: any};
    surveyors: string[];
    title: string;
    type: 'stationary' | 'movement';
    fields: StudyField[];
    map: FeatureCollection;
}

export interface ApplicationState {
    token: null | string;
    currentStudy: null | Study;
    studies: {[key: string]: Study};
}

const fetchParams: RequestInit = {
    //mode: "sam", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
}

function getFromApi(route: string) {
    const hostname = getEnvVariableRetry('SERVER_HOSTNAME');
    return fetch(hostname + route, {
        ...fetchParams,
        method: 'GET'
    })
}

function putToApi(route: string, data: any) {
    const body = JSON.stringify(snakecasePayload(data))
    const hostname = getEnvVariableRetry('SERVER_HOSTNAME');
    return fetch(hostname + route, {
        ...fetchParams,
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body
    })
}

async function postToApi(route: string, data: any) {
    const body = JSON.stringify(snakecasePayload(data));
    try {
        return await fetch(getEnvVariableRetry('SERVER_HOSTNAME') + route, {
            ...fetchParams,
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body
        })
    } catch (err) {
        console.error(`[uri ${route}] [data ${JSON.stringify(data)}] ${err}`)
        throw err;
    }
}

function deleteFromApi(route: string) {
    return fetch(getEnvVariableRetry('SERVER_HOSTNAME') + route, {
        ...fetchParams,
        method: 'DELETE'
    })
}

async function fetchSurveysForStudy(studyId: string) {
    const study = applicationState.studies[studyId];
    if (!study.surveys) {
        const surveysReq = await getFromApi(`/api/studies/${studyId}/surveys`);
        const surveysAsArr = camelcaseKeys(await surveysReq.json());
        study.surveys = groupArrayOfObjectsBy(surveysAsArr, 'surveyId');
    }
    return study;
}

export async function getStudies(): Promise<{[studyId: string]: Study}> {
    const studiesReq = await getFromApi('/api/studies?type=admin');
    const studies = camelcaseKeys(await studiesReq.json());
    return groupArrayOfObjectsBy(studies, 'studyId');
}

export async function updateStudy(studyInput) {
    const studyId = applicationState.currentStudy.studyId;
    const surveys = Object.values(toJS(studyInput.surveys))
    const study = toJS(applicationState.currentStudy);
    study.surveys = surveys;
    const response = await putToApi(`/api/studies/${studyId}`, study);
}

export async function saveNewStudy(studyInput: Study) {
    const study: Study = toJS(studyInput)
    study.surveys = Object.values(toJS(studyInput.surveys)).map(survey => {
        const { method = 'analog', representation = 'absolute' } = survey;
        return {
            method,
            representation,
            ...survey
        }
    });
    const response = await postToApi(`/api/studies`, study);
}

export async function deleteStudy(studyId: string) {
    const route = `/api/studies/${studyId}`;
    const response = await deleteFromApi(route);
    delete applicationState.studies[studyId];
}

export async function selectNewStudy(study: any) {
    applicationState.currentStudy = await fetchSurveysForStudy(study.studyId);
}

export function studyEmptySkeleton(): Study {
    return {
        studyId: '',
        title: '',
        protocolVersion: '1.0',
        surveys: {},
        surveyors: [],
        type: 'stationary',
        map: {
            type: 'FeatureCollection',
            features: []
        },
        fields: []
    }
}

export function setCurrentStudyEmptySkeleton() {
    const studyId =  uuid.v4()
    const study = studyEmptySkeleton();
    applicationState.studies[studyId] = {
        ...study,
        studyId
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
    applicationState.currentStudy.surveyors.push(email);
}

export async function init() {
    if (Object.keys(applicationState.studies).length == 0) {
        const studies = await getStudies();
        applicationState.studies = studies;
        const studyIds = Object.keys(studies);
        await Promise.all(studyIds.map(fetchSurveysForStudy));
    }
}

let applicationState: ApplicationState = observable({
    currentStudy: null,
    studies: {},
    token: null
});

autorun(() => {
});

export default applicationState;
