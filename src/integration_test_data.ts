import { Feature, FeatureCollection } from 'geojson';
import { Study } from './routes/api_types';
import moment from 'moment';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: process.env.DOTENV_CONFIG_DIR
        ? path.join(process.env.DOTENV_CONFIG_DIR, '.env')
        : 'config/integration.env'
});

const {
    INTEGRATION_TEST_ADMIN_PASSWORD,
    INTEGRATION_TEST_ADMIN_USER,
    INTEGRATION_TEST_SURVEYOR_PASSWORD,
    INTEGRATION_TEST_SURVEYOR_USER
} = process.env;

export const adminUser = {
    email: INTEGRATION_TEST_ADMIN_USER,
    password: INTEGRATION_TEST_ADMIN_PASSWORD
};

export const surveyorUser = {
    email: INTEGRATION_TEST_SURVEYOR_USER,
    password: INTEGRATION_TEST_SURVEYOR_PASSWORD
};

const SeaBassFishCountConfig = {
    studyId: 'b243745c-f106-4f1c-98e2-f0b2ade1baf5'
};

const kelpForestConfig = {
    locationId: 'cce59ff5-5751-4278-beeb-0b81784d1d8a'
};

const southEndCoveConfig = {
    locationId: 'cddcc8bb-34ce-4442-a3fa-bef0bfc9a120'
};

const marchOnWashingtonCountConfig = {
    studyId: '860b763b-a2d9-452d-b53a-073ef9523c23'
};

const reflectingPoolConfig = {
    locationId: 'c02c360b-baa4-4321-a40e-06757defd0b5'
};

const lincolnMemorialConfig = {
    locationId: '5bde4737-96e8-4fd6-8d5f-2c9e62c931ed'
};

const releasetheseabassSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: '4bfb8cde-903b-4a96-98ce-716403e7e5bc',
    start_date: '2019-02-05T21:04:33.221Z',
    end_date: '2019-02-05T22:04:33.224Z',
    email: 'releasetheseabass@gmail.com',
    location_id: 'cce59ff5-5751-4278-beeb-0b81784d1d8a',
    title: 'swing shift'
};

const sebastianSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: 'dcb61274-3979-4852-a1e0-05bfc06fb61c',
    start_date: '2019-02-05T21:05:55.523Z',
    end_date: '2019-02-05T22:05:55.523Z',
    email: 'sebastian@sidewalklabs.com',
    location_id: 'cce59ff5-5751-4278-beeb-0b81784d1d8a',
    title: 'late late shift'
};
const pandanantaSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: '0f62328e-1d99-43a6-9de5-11ec6003d76a',
    start_date: '2019-02-05T21:05:56.559Z',
    end_date: '2019-02-05T22:05:56.559Z',
    email: 'pandananta@gmail.com',
    location_id: 'cce59ff5-5751-4278-beeb-0b81784d1d8a',
    title: 'panda panda panda'
};
const mhtSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: 'facab2d0-22fb-49b0-904b-795501142aa7',
    start_date: '2019-02-05T21:05:57.284Z',
    end_date: '2019-02-05T22:05:57.284Z',
    email: 'mht@sidewalklabs.com',
    location_id: 'cce59ff5-5751-4278-beeb-0b81784d1d8a',
    title: 'mht airport'
};
const mattSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: '7251f996-ade0-49cb-88c5-ef149baa14e7',
    start_date: '2019-02-05T21:06:05.895Z',
    end_date: '2019-02-05T22:06:05.895Z',
    email: 'matt@sidewalklabs.com',
    location_id: 'cce59ff5-5751-4278-beeb-0b81784d1d8a',
    title: 'the breuer experience'
};
const interfacedSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: '2ddbe79b-5132-4559-8987-930c90b6a26a',
    start_date: '2019-02-05T21:06:09.837Z',
    end_date: '2019-02-05T22:06:09.837Z',
    email: 'interfaced@gmail.com',
    location_id: 'cce59ff5-5751-4278-beeb-0b81784d1d8a',
    title: 'this is patrick'
};

const kelpForest: Feature = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-117.27291967192288, 32.850977041594874],
                [-117.27319555637224, 32.85076845176209],
                [-117.27306987562771, 32.85060363985181],
                [-117.27273881435396, 32.85065514357228],
                [-117.27291967192288, 32.850977041594874]
            ]
        ]
    },
    properties: {
        name: 'Kelp Forest',
        location_id: kelpForestConfig.locationId
    }
};

const southEndCove: Feature = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-117.27223992347719, 32.85042273262966],
                [-117.27284073829652, 32.85032487512764],
                [-117.27285913068046, 32.85018066365812],
                [-117.27245450019838, 32.8502218672734],
                [-117.27223992347719, 32.85042273262966]
            ]
        ]
    },
    properties: {
        name: 'Cove -- South End',
        location_id: southEndCoveConfig.locationId
    }
};

const laJollaBeach: FeatureCollection = {
    type: 'FeatureCollection',
    features: [kelpForest, southEndCove]
};

const dataPointOne = {
    gender: 'unknown',
    age: '15-24',
    posture: 'standing',
    data_point_id: '5ac9f389-51a9-444c-85c6-ddfe0d306a87',
    activities: ['conversing', 'electronic_engagement'],
    date: moment().toISOString()
};

const dataPointTwo = {
    gender: 'female',
    age: '25-64',
    posture: 'lying',
    data_point_id: 'a878b48b-9c9f-46bc-8aa7-171c31135fd2',
    activities: ['commercial', 'consuming'],
    date: moment().toISOString()
};

const dataPointThree = {
    gender: 'male',
    age: '65+',
    posture: 'sitting_informal',
    data_point_id: '77412f57-decb-4db7-8b68-77379c1ac01d',
    activities: ['commercial', 'consuming'],
    date: moment().toISOString()
};

export const SeaBassFishCountDataPoints = [dataPointOne, dataPointTwo, dataPointThree];

export const SeaBassFishCountStudy: Study = {
    study_id: SeaBassFishCountConfig.studyId,
    title: 'Sea Bass Fish Count',
    author: 'californianseabass',
    author_url: 'github.com/californianseabass',
    description: 'Help Sea Bass count his underwater friends!',
    location: 'La Jolla Cove, San Diego',
    protocol_version: '1.0',
    status: 'active',
    type: 'stationary',
    fields: ['gender', 'age', 'posture', 'notes', 'activities'],
    surveyors: [
        'mht@sidewalklabs.com',
        'interfaced@gmail.com',
        'matt@sidewalklabs.com',
        'pandananta@gmail.com',
        'sebastian@sidewalklabs.com',
        'releasetheseabass@gmail.com'
    ],
    surveys: [
        interfacedSurvey,
        mattSurvey,
        mhtSurvey,
        pandanantaSurvey,
        sebastianSurvey,
        releasetheseabassSurvey
    ],
    map: laJollaBeach
};

const lincolnMemorial: Feature = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-77.05072671175004, 38.890044236476676],
                [-77.04958945512773, 38.89002753484727],
                [-77.04912811517717, 38.88962669456398],
                [-77.04924613237382, 38.888916867679654],
                [-77.04969674348833, 38.88849931914023],
                [-77.05058723688126, 38.88849096814439],
                [-77.05114513635637, 38.8888584110319],
                [-77.05122023820878, 38.88951813326466],
                [-77.05072671175004, 38.890044236476676]
            ]
        ]
    },
    properties: {
        name: 'Lincoln Memorial',
        location_id: lincolnMemorialConfig.locationId
    }
};

const reflectingPool: Feature = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-77.04879552125932, 38.88979371162358],
                [-77.04880625009538, 38.88877490145162],
                [-77.04594165086748, 38.88883335816813],
                [-77.04598456621171, 38.889835465827126],
                [-77.04879552125932, 38.88979371162358]
            ]
        ]
    },
    properties: {
        name: 'Reflecting Pool',
        location_id: reflectingPoolConfig.locationId
    }
};

const washingtonMall: FeatureCollection = {
    type: 'FeatureCollection',
    features: [lincolnMemorial, reflectingPool]
};

const releasetheseabassWashingtonSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: '12e41cd7-38cf-4acc-bfe3-4c624ce54d78',
    start_date: '2019-02-05T21:04:33.221Z',
    end_date: '2019-02-05T22:04:33.224Z',
    email: 'releasetheseabass@gmail.com',
    location_id: reflectingPoolConfig.locationId,
    title: 'reflecting pool'
};
const sebastianWashingtonSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: '47cd5259-356e-4e0d-9bc4-77d04e73b6d2',
    start_date: '2019-02-05T21:05:55.523Z',
    end_date: '2019-02-05T22:05:55.523Z',
    email: 'sebastian@sidewalklabs.com',
    location_id: lincolnMemorialConfig.locationId,
    title: 'lincoln memorial'
};
const pandanantaWashingtonSurvey = {
    method: 'analog',
    representation: 'absolute',
    survey_id: 'b10670ea-267e-4f36-a5e9-559a940fef1e',
    start_date: '2019-02-05T21:05:56.559Z',
    end_date: '2019-02-05T22:05:56.559Z',
    email: 'pandananta@gmail.com',
    location_id: lincolnMemorialConfig.locationId,
    title: 'lincoln memorial'
};

export const MarchOnWashington: Study = {
    study_id: marchOnWashingtonCountConfig.studyId,
    title: 'March on Washington for Jobs and Freedom',
    author: 'californianseabass',
    author_url: 'github.com/californianseabass',
    description: 'celebrating the centennial of the signing of the emancipation proclamation',
    location: 'Lincoln Memorial',
    protocol_version: '1.0',
    status: 'active',
    type: 'stationary',
    fields: ['age', 'posture', 'notes'],
    surveyors: [
        'pandananta@gmail.com',
        'releasetheseabass@gmail.com',
        'sebastian@sidewalklabs.com'
    ],
    surveys: [
        pandanantaWashingtonSurvey,
        sebastianWashingtonSurvey,
        releasetheseabassWashingtonSurvey
    ],
    map: washingtonMall
};

export const SampleDataPointOne = {
    data_point_id: '8e6c8475-6812-41d0-ad27-3795b8897ea8',
    color: '#D10115',
    title: 'Person 2',
    date: moment().toISOString(),
    gender: 'unknown',
    notes: 'to infinity and beyond!',
    location: {
        type: 'Point',
        coordinates: [-73.99744212627411, 40.730430884370335]
    }
};
