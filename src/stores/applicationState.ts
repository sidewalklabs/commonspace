import camelcaseKeys from 'camelcase-keys';
import { observable, autorun, toJS, get, set } from 'mobx';
import moment from 'moment';
import uuid from 'uuid';

import { groupArrayOfObjectsBy } from '../utils';
import { StudyField } from '../datastore/utils';
import { surveysForStudy, StudyType } from '../datastore/study';
import { FeatureCollection } from 'geojson';
import uiState, { setSnackBar } from './ui';

import {  snakecasePayload } from '../utils';

export interface Study {
    studyId: string;
    protocolVersion: string;
    surveys: {[key: string]: any};
    surveyors: string[];
    title: string;
    type: StudyType;
    fields: StudyField[];
    map: FeatureCollection;
    location: string;
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

async function getFromApi(route: string) {
    try {
        const response = await fetch(route, {
            ...fetchParams,
            method: 'GET'
        })
        if (response.status !== 200) {
            throw Error(`${response.status} ${response.statusText}`);
        }
        return response;
    } catch (err) {
        console.error(`[route ${route}] ${err}`)
        throw err;
    }
}

async function putToApi(route: string, data: any) {
    const body = JSON.stringify(snakecasePayload(data))
    try {
        const response = await fetch(route, {
            ...fetchParams,
            method: "PUT",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body
        })
        if (response.status !== 200) {
            throw Error(`${response.status} ${response.statusText}`);
        }
        return response;
    } catch (err) {
        console.error(`[route ${route}] [data ${body}] ${err}`)
        throw err;
    }
}

async function postToApi(route: string, data: any) {
    const body = JSON.stringify(snakecasePayload(data));
    try {
        const response = await fetch(route, {
            ...fetchParams,
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body
        })
        if (response.status !== 200) {
            throw Error(`${response.status} ${response.statusText}`);
        }
        return response;
    } catch (err) {
        console.error(`[route ${route}] [data ${body}] ${err}`)
        throw err;
    }
}

function deleteFromApi(route: string) {
    return fetch(process.env.SERVER_HOSTNAME + route, {
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
    try {
        const studiesReq = await getFromApi('/api/studies?type=admin');
        const studies = camelcaseKeys(await studiesReq.json());
        return groupArrayOfObjectsBy(studies, 'studyId');
    } catch (error) {
        setSnackBar('error', `Could not load studies: ${error}`);
        throw error;
    }
}

export async function updateStudy(studyInput) {
    const  { studyId } = studyInput;
    const surveys = Object.values(toJS(studyInput.surveys))
    const study = toJS(applicationState.currentStudy);
    study.surveys = surveys;
    try {
        const response = await putToApi(`/api/studies/${studyId}`, study);
        setSnackBar('success', `Updated study ${studyInput.title}`);
    } catch (error) {
        setSnackBar('error', `Unable to update study ${studyInput.title}`);
        throw error;
    }
}

function handleErrors(f: (...x: any[]) => Promise<Response>): (...y: any[]) => Promise<Response> {
    return async (...args: any[]) => {
        const response = await f(args);
        if (response.status !== 200) {
            throw new Error(`[args: ${args}] [stausText ${response.statusText}] ${response.status}`);
        }
        return response;
    }
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
    const route = `/api/studies`;
    try {
        await postToApi(route, study);
        applicationState.studies[study.studyId] = study;
        setSnackBar('success', 'Saved Study!')
    } catch (error) {
        setSnackBar('error', 'Failed to save study');
        throw error;
    }
}

export async function deleteStudy(studyId: string) {
    const route = `/api/studies/${studyId}`;
    const response = await deleteFromApi(route);
    delete applicationState.studies[studyId];
}

export async function selectNewStudy(study: any) {
    applicationState.currentStudy = await fetchSurveysForStudy(study.studyId);
}

export function updateFeatureName(study: Study, locationId: string, name: string) {
    const { features } = study.map;
    const index = features.findIndex(({properties}) => {
        if (!properties) return false;
        const {name, locationId: currentId} = properties;
        return currentId === locationId
    });
    if (index === -1) {
        throw new Error(`could not location a feature with locationId: ${locationId}`)
    }

    let newFeatures;
    const newFeature = features[index]
    newFeature.properties = {name, locationId}
    if (index === 0) {
        newFeatures = [newFeature, ...features.slice(1)]
    } else if (index === features.length) {
        newFeatures = [...features.slice(0, index), newFeature]
    } else {
        newFeatures = [...features.slice(0, index), {name, locationId}, ...features.slice(index+1)]
    }
}

export function studyEmptySkeleton(): Study {
    return {
        studyId: uuid.v4(),
        title: '',
        location: '',
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
    const study = studyEmptySkeleton();
    applicationState.studies[study.studyId] = study
    applicationState.currentStudy = applicationState.studies[study.studyId];
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
    const studies = await getStudies();
    applicationState.studies = studies;
    const studyIds = Object.keys(studies);
    await Promise.all(studyIds.map(fetchSurveysForStudy));
}

let applicationState: ApplicationState = observable({
    currentStudy: null,
    studies: {},
    token: null
});

autorun(() => {
    if (applicationState.currentStudy) {
        console.log(toJS(applicationState.currentStudy.map))
    }
});

export default applicationState;
