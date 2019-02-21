import 'babel-polyfill';
import camelcaseKeys from 'camelcase-keys';
import { FeatureCollection } from 'geojson';
import path from 'path';
import fetch from 'isomorphic-fetch';

import {
    adminUser,
    surveyorUser,
    SeaBassFishCountDataPoints,
    SeaBassFishCountStudy,
    MarchOnWashington
} from './integration_test_data';
import { snakecasePayload } from './utils';
import dotenv from 'dotenv';
import {
    deleteRest,
    postRestNoBody,
    postRest,
    getRest,
    clearLocationsFromApi,
    getStudiesForAdmin,
    loginJwt,
    User,
    UnauthorizedError,
    ResourceNotFoundError
} from './client';
dotenv.config({
    path: process.env.DOTENV_CONFIG_DIR
        ? path.join(process.env.DOTENV_CONFIG_DIR, '.env')
        : 'config/integration.env'
});

const { INTEGRATION_TEST_SERVER: API_SERVER = '' } = process.env;

// async function clearUserFromDatabase(email: string, map: FeatureCollection) {
//     const host = process.env.DB_HOST;
//     const dbUser = process.env.DB_USER;
//     const dbPass = process.env.DB_PASS;
//     const dbName = process.env.DB_NAME;
//     const dbPort = parseInt(process.env.DB_PORT);
//     const pool = new pg.Pool({
//         max: 1,
//         host: host,
//         user: dbUser,
//         password: dbPass,
//         database: dbName,
//         port: dbPort
//     })
//     const query = `DELETE
//                    FROM data_collection.study stu
//                    USING public.users usr
//                    WHERE usr.user_id = stu.user_id and usr.email = $1
//                    returning tablename`
//     const values = [email];
//     const { rowCount: rc1, rows } = await pool.query(query, values);
//     await Promise.all(rows.map(({tablename}) => {
//         return pool.query(`drop table ${tablename}`);
//     }))
//     await clearLocations(map);
//     console.log(`deleted ${rc1} studies for user ${email}`)
//     console.log(JSON.stringify(rows));
//     const query2 = `DELETE
//                    FROM public.users
//                    WHERE users.email = $1`
//     const values2 = [email];
//     const { rowCount: rc2 } = await pool.query(query2, values2);
//     if (rc2 === 1) {
//         console.log(`Deleted user for email ${email}`);
//     }
//     return;
// }

// test that all a user's data can be deleted, could be more explicit, but tests basic not failing
async function clearUserFromApp(maps: FeatureCollection[], token: string) {
    await Promise.all(maps.map(m => clearLocationsFromApi(API_SERVER, m, token)));
    try {
        await deleteRest(API_SERVER + '/api/user', token);
    } catch (error) {
        if (!(error instanceof ResourceNotFoundError)) {
            throw error;
        }
    }
}

async function login(user: User) {
    const uri = `${API_SERVER}/auth/login`;
    const { headers } = await postRest(uri, user);
    const [keyValue, path, expires] = headers.get('set-cookie').split(';');
    const [key, token] = keyValue.split('=');
    return token;
}

async function signupJwt(user: User) {
    const uri = `${API_SERVER}/auth/signup`;
    const requestBody = JSON.stringify(user);
    const fetchParams = {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Accept: 'application/bearer.token+json'
        },
        body: requestBody
    };

    const response = await fetch(uri, fetchParams);
    const responseBody = await response.json();
    return responseBody;
}

beforeAll(async () => {
    const { token: adminToDeleteToken } = await loginJwt(API_SERVER, adminUser);
    if (adminToDeleteToken) {
        const maps = [SeaBassFishCountStudy.map, MarchOnWashington.map];
        await clearUserFromApp(maps, adminToDeleteToken);
    }
});

test("we expect an authoization error if we don't yet have an authentication token", async () => {
    await expect(getRest(API_SERVER + '/api/studies?type=surveyor')).rejects.toThrow(
        UnauthorizedError
    );
});

describe('create/delete/modify studies', async () => {
    let surveyorToken, adminToken;

    test('login a previously existing user', async () => {
        const { token } = await loginJwt(API_SERVER, surveyorUser);
        expect(token).toBeTruthy();
        surveyorToken = token;
    });

    test('signup a new user', async () => {
        const { token } = await signupJwt(adminUser);
        expect(token).toBeTruthy();
        adminToken = token;
    });

    test('create a new study', async () => {
        const study = await postRest(
            API_SERVER + '/api/studies',
            SeaBassFishCountStudy,
            adminToken
        );

        const studiesForAdmin = (await getRest(
            API_SERVER + '/api/studies?type=admin',
            adminToken
        )) as any[];
        expect(studiesForAdmin.length).toBe(1);
    });

    test('surveyor should have one study for the new fish count study', async () => {
        const studiesForSurveyor = (await getRest(
            API_SERVER + '/api/studies?type=surveyor',
            adminToken
        )) as any[];
        expect(studiesForSurveyor.length).toBe(1);
    });

    test('admin should see all the surveys saved on their new study', async () => {
        const { study_id: studyId } = SeaBassFishCountStudy;
        const expectedNumberOfSurveys = SeaBassFishCountStudy.surveys.length;
        const studiesForAdmin = (await getRest(
            API_SERVER + '/api/studies?type=admin',
            adminToken
        )) as any[];
        expect(studiesForAdmin[0].surveys.length).toBe(expectedNumberOfSurveys);

        const surveys = (await getRest(
            API_SERVER + `/api/studies/${studyId}/surveys`,
            adminToken
        )) as any[];
        expect(surveys.length).toBe(expectedNumberOfSurveys);
    });

    test('a surveyor should only be able to see their own surveys', async () => {
        const { study_id: studyId } = SeaBassFishCountStudy;
        const surveys = (await getRest(
            API_SERVER + `/api/studies/${studyId}/surveys`,
            surveyorToken
        )) as any[];
        expect(surveys.length).toBe(1);
    });

    test('the admin should be able to delete their study making it unavailable from the api', async () => {
        await deleteRest(API_SERVER + '/api/studies/' + SeaBassFishCountStudy.study_id, adminToken);
        await clearLocationsFromApi(API_SERVER, SeaBassFishCountStudy.map, adminToken);
        await expect(
            getRest(API_SERVER + '/api/studies/' + SeaBassFishCountStudy.study_id, adminToken)
        ).rejects.toThrow(ResourceNotFoundError);
    });

    test('save an array of studies to the studies endpoint', async () => {
        const saveMultipleStudies = [SeaBassFishCountStudy, MarchOnWashington];
        await postRest(API_SERVER + '/api/studies', saveMultipleStudies, adminToken);
        const multipleStudies = (await getRest(
            API_SERVER + '/api/studies?type=admin',
            adminToken
        )) as any[];
        expect(multipleStudies.length).toBe(saveMultipleStudies.length);
    });

    test('save data points to a survey if user is a surveyor', async () => {
        const surveyorSurvey = SeaBassFishCountStudy.surveys.filter(({ surveyor_email }) => {
            return surveyor_email === surveyorUser.email;
        })[0];
        const { survey_id } = surveyorSurvey;
        //const dataPoint = SeaBassFishCountDataPoints[0]
        await Promise.all(
            SeaBassFishCountDataPoints.map(dataPoint => {
                return postRestNoBody(
                    API_SERVER + `/api/surveys/${survey_id}/datapoints`,
                    dataPoint,
                    surveyorToken
                );
            })
        );
        const dataPoints = (await getRest(
            API_SERVER + `/api/surveys/${survey_id}/datapoints`,
            surveyorToken
        )) as any[];
        expect(dataPoints.length).toBe(SeaBassFishCountDataPoints.length);
    });

    test('saving a data point fails if the user is not signed up for a surveyor', async () => {
        const surveyorSurvey = SeaBassFishCountStudy.surveys.filter(({ surveyor_email }) => {
            return surveyor_email === surveyorUser.email;
        })[0];
        const { survey_id } = surveyorSurvey;
        const dataPoint = SeaBassFishCountDataPoints[0];
        await expect(
            postRestNoBody(
                API_SERVER + `/api/surveys/${survey_id}/datapoints`,
                dataPoint,
                adminToken
            )
        ).rejects.toThrow(UnauthorizedError);
    });

    test('we should be able to download all of the users data and it should have the data points nested with the survey', async () => {
        const allStudies = (await getRest(
            API_SERVER + '/api/studies/download',
            adminToken
        )) as any[];

        const { survey_id: surveyorSurveyId } = SeaBassFishCountStudy.surveys.filter(
            ({ surveyor_email }) => {
                return surveyor_email === surveyorUser.email;
            }
        )[0];
        expect(allStudies.length).toBe(2);

        const study = allStudies.filter(
            ({ study_id }) => study_id === SeaBassFishCountStudy.study_id
        )[0];
        if (!study) {
            console.error(allStudies);
        }
        const surveyorsSurvey = study.surveys.filter(
            ({ survey_id }) => survey_id === surveyorSurveyId
        )[0];
        if (!surveyorsSurvey) {
            console.error(study);
        }
        expect(surveyorsSurvey.data_points.length).toBe(SeaBassFishCountDataPoints.length);
    });

    test('once a user logout out using a token, the token should result in a 401', async () => {
        await postRestNoBody(API_SERVER + '/auth/logout', {}, surveyorToken);
        await expect(
            getRest(API_SERVER + '/api/studies?type=surveyor', surveyorToken)
        ).rejects.toThrow(UnauthorizedError);
    });
});
