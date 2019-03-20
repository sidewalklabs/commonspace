import camelcaseKeys from 'camelcase-keys';
import { Feature, FeatureCollection } from 'geojson';
import { observable, autorun, toJS, computed } from 'mobx';
import moment from 'moment';
import { center } from '@turf/turf';
import uuid from 'uuid';

import { groupArrayOfObjectsBy } from '../utils';
import { StudyField } from '../datastore/utils';
import { StudyType } from '../datastore/study';
import { setSnackBar } from './ui';
import { deleteRest, getRest, postRest, UnauthorizedError, putRest } from '../client';
import { logoutIfError, navigate } from './router';

const DEFAULT_LATITUDE = 40.730819;
const DEFAULT_LONGITUDE = -73.997461;

export const DEFAULT_CENTER = {
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE
};

interface LongitudeLatitude {
    longitude: number;
    latitude: number;
}

interface DataPoint {
    surveyId: string;
    dataPointId: string;
    creationDate?: string;
    lastUpdated?: string;
    gender?: string;
    age?: string;
    mode?: string;
    posture?: string;
    activities?: string;
    groups?: string;
    object?: string;
    location?: string;
    notes?: string;
}

export interface Study {
    studyId: string;
    author: string;
    authorUrl: string;
    description: string;
    protocolVersion: string;
    surveys: { [key: string]: any };
    surveyors: string[];
    title: string;
    type: StudyType;
    fields: StudyField[];
    map: FeatureCollection;
    location: string;
    createdAt?: number; // these two don't exist until the study has been saved to the backend
    lastUpdated?: number;
    datapoints?: DataPoint[];
}

export interface ApplicationState {
    draftSurveyor: string;
    currentStudy: null | Study;
    studies: { [key: string]: Study };
    mapCenters: { [key: string]: LongitudeLatitude };
}

const fetchParams: RequestInit = {
    //mode: "sam", // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
};

export const getStudies = logoutIfError(UnauthorizedError, async () => {
    try {
        const studies = camelcaseKeys(await getRest('/api/studies?type=admin'));

        studies.forEach(study => {
            const notesIndex = study.fields.indexOf('notes');
            if (notesIndex !== 1) {
                const { fields } = study;
                study.fields = fields
                    .slice(0, notesIndex)
                    .concat(fields.slice(notesIndex + 1, fields.length));
            }
            // TODO: need to camel case the surveys array, but for some reason
            // deep camelcasing studies breaks the map coordinates
            study.map.features = study.map.features.map(f => {
                return {
                    ...f,
                    properties: camelcaseKeys(f.properties)
                };
            });
            study.surveys = study.surveys.map(survey => camelcaseKeys(survey));
            study.surveys = groupArrayOfObjectsBy(study.surveys, 'surveyId');
        });
        return groupArrayOfObjectsBy<Study>(studies, 'studyId');
    } catch (error) {
        setSnackBar('error', `Could not load studies`);
        navigate('/login');
    }
});

export const updateStudy = logoutIfError(UnauthorizedError, async (studyInput: Study) => {
    const { studyId } = studyInput;
    const study: Study = toJS(studyInput);
    if (study.fields.indexOf('notes') === -1) {
        study.fields = [...study.fields, 'notes'];
    }
    study.surveys = Object.values(toJS(studyInput.surveys)).map(survey => {
        const { method = 'analog', representation = 'absolute' } = survey;
        return {
            method,
            representation,
            ...survey
        };
    });
    try {
        await putRest(`/api/studies/${studyId}`, study);
        setSnackBar('success', `Updated study ${studyInput.title}`);
    } catch (error) {
        setSnackBar('error', `Unable to update study ${studyInput.title}`);
        throw error;
    }
});

export const saveNewStudy = logoutIfError(UnauthorizedError, async (studyInput: Study) => {
    const study: Study = toJS(studyInput);
    if (study.fields.indexOf('notes') === -1) {
        study.fields = [...study.fields, 'notes'];
    }
    study.surveys = Object.values(toJS(studyInput.surveys)).map(survey => {
        const { method = 'analog', representation = 'absolute' } = survey;
        return {
            method,
            representation,
            ...survey
        };
    });
    const route = `/api/studies`;
    try {
        const createdStudy = camelcaseKeys(await postRest(route, study));
        // TODO: need to camel case the surveys array, but for some reason deep camelcasing a study breaks the geojson
        createdStudy.surveys = createdStudy.surveys.map(survey => camelcaseKeys(survey));
        createdStudy.surveys = groupArrayOfObjectsBy(createdStudy.surveys, 'surveyId');
        applicationState.currentStudy = createdStudy;
        applicationState.studies[createdStudy.studyId] = createdStudy;
        setSnackBar('success', 'Saved Study!');
    } catch (error) {
        applicationState.currentStudy = null;
        setSnackBar('error', 'Failed to save study');
        throw error;
    }
});

export const deleteStudy = logoutIfError(UnauthorizedError, async (studyId: string) => {
    try {
        await deleteRest(`/api/studies/${studyId}`);
        delete applicationState.studies[studyId];
    } catch (error) {
        setSnackBar('error', 'Failed to delete study');
        throw error;
    }
});

export function getCurrentStudyId() {
    if (applicationState.currentStudy) {
        return applicationState.currentStudy.studyId;
    }
    return undefined;
}

export async function selectNewStudy(study: any) {
    applicationState.currentStudy = study;

    try {
        applicationState.currentStudy.datapoints = camelcaseKeys(
            await getRest(`/api/studies/${study.studyId}/datapoints`)
        );
    } catch (error) {
        setSnackBar('error', `Unable to get study datapoints!`);
        throw error;
    }
}

export function deleteFeatureFromMap(locationId: string): void {
    const { currentStudy } = applicationState;
    const { map } = currentStudy;
    const features: Feature[] = toJS(map.features);
    applicationState.currentStudy.map.features = features.filter(({ properties }) => {
        return properties.locationId !== locationId;
    });
}

export function updateFeatureName(study: Study, locationId: string, name: string) {
    const { features } = study.map;
    const index = features.findIndex(({ properties }) => {
        if (!properties) return false;
        const { name, locationId: currentId } = properties;
        return currentId === locationId;
    });
    if (index === -1) {
        throw new Error(`could not location a feature with locationId: ${locationId}`);
    }

    let newFeatures;
    const newFeature = features[index];
    newFeature.properties = { name, locationId };
    if (index === 0) {
        newFeatures = [newFeature, ...features.slice(1)];
    } else if (index === features.length) {
        newFeatures = [...features.slice(0, index), newFeature];
    } else {
        newFeatures = [
            ...features.slice(0, index),
            { name, locationId },
            ...features.slice(index + 1)
        ];
    }
}

export function studyEmptySkeleton(): Study {
    return {
        studyId: uuid.v4(),
        title: '',
        author: '',
        authorUrl: '',
        description: '',
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
    };
}

export function setCurrentStudyEmptySkeleton() {
    const study = studyEmptySkeleton();
    applicationState.studies[study.studyId] = study;
    applicationState.currentStudy = applicationState.studies[study.studyId];
}

export async function addNewSurveyToCurrentStudy() {
    const newSurveyId = uuid.v4();
    const startMoment = moment().startOf('hour');
    const newSurvey = {
        surveyId: newSurveyId,
        startDate: startMoment.toISOString(),
        endDate: startMoment.add(1, 'hours').toISOString(),
        email: '',
        locationId: '',
        title: startMoment.format('h a')
    };

    applicationState.currentStudy.surveys = {
        ...applicationState.currentStudy.surveys,
        [newSurveyId]: newSurvey
    };
}

export async function addNewSurveyorToSurvey(studyId: string, email: string) {
    applicationState.currentStudy.surveyors.push(email);
}

export async function init() {
    const studies = await getStudies();
    applicationState.studies = studies;
}

export function resetApplicationState() {
    applicationState.studies = {};
    applicationState.currentStudy = null;
    applicationState.mapCenters = {};
}

let applicationState: ApplicationState = observable({
    draftSurveyor: '',
    currentStudy: null,
    studies: {},
    mapCenters: {}
});

async function calculateMapCenter(map: FeatureCollection): Promise<LongitudeLatitude> {
    let latitude, longitude;
    if (map.features && map.features.length > 0) {
        // @ts-ignore
        const { geometry } = center(map);
        longitude = geometry.coordinates[0];
        latitude = geometry.coordinates[1];
    } else {
        longitude = DEFAULT_LONGITUDE;
        latitude = DEFAULT_LATITUDE;
    }
    return { longitude, latitude };
}

const mapCentersComputation = computed(async () => {
    const { currentStudy, studies } = applicationState;
    let currentStudyCenter = null;
    if (currentStudy && currentStudy.map.features.length > 0) {
        const { studyId } = currentStudy;
        const { longitude, latitude } = await calculateMapCenter(currentStudy.map);
        currentStudyCenter = {};
        currentStudyCenter[studyId] = {
            longitude,
            latitude
        };
    }
    const studyIdToCenter: { [key: string]: LongitudeLatitude }[] = await Promise.all(
        Object.keys(studies).map(async studyId => {
            const study = studies[studyId];
            let res: { [key: string]: LongitudeLatitude } = {};
            if (study.map) {
                res[studyId] = await calculateMapCenter(study.map);
            } else {
                res[studyId] = DEFAULT_CENTER;
            }
            return res;
        })
    );

    const result: { [key: string]: LongitudeLatitude } = currentStudyCenter
        ? Object.assign({}, ...studyIdToCenter, currentStudyCenter)
        : Object.assign({}, ...studyIdToCenter);
    return result;
});

mapCentersComputation.observe(async change => {
    const { mapCenters } = applicationState;
    const newValue = await change.newValue;
    if (newValue) {
        applicationState.mapCenters = newValue;
    }
});

export function getMapCenterForStudy(studyId: string) {
    let latitude, longitude;
    const { mapCenters } = applicationState;
    if (mapCenters[studyId]) {
        const studyCenter = mapCenters[studyId];
        latitude = studyCenter.latitude;
        longitude = studyCenter.longitude;
    } else {
        latitude = DEFAULT_CENTER.latitude;
        longitude = DEFAULT_CENTER.longitude;
    }
    return { latitude, longitude };
}

export default applicationState;
