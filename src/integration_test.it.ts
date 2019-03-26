import 'babel-polyfill';
import { FeatureCollection } from 'geojson';
import path from 'path';
import fetch from 'isomorphic-fetch';

import {
    adminUser,
    surveyorUser,
    SeaBassFishCountDataPoints,
    SeaBassFishCountStudy,
    MarchOnWashington,
    SampleDataPointOne
} from './integration_test_data';
import { snakecasePayload } from './utils';
import dotenv from 'dotenv';
import {
    deleteRest,
    postRest,
    putRest,
    getRest,
    clearLocationsFromApi,
    getStudiesForAdmin,
    loginJwt,
    signupJwt,
    User,
    UnauthorizedError,
    ResourceNotFoundError
} from './client';

import { DataPoint, Study, Survey } from './routes/api_types';

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

beforeAll(async () => {
    const { token: adminToDeleteToken } = await loginJwt(API_SERVER, adminUser);
    if (adminToDeleteToken) {
        const maps = [SeaBassFishCountStudy.map, MarchOnWashington.map];
        await clearUserFromApp(maps, adminToDeleteToken);
    }
});

test("we expect an authoization error if we don't yet have an authentication token", async () => {
    await expect(getRest<Study[]>(API_SERVER + '/api/studies?type=surveyor')).rejects.toThrow(
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
        const { token } = await signupJwt(API_SERVER, adminUser);
        expect(token).toBeTruthy();
        adminToken = token;
    });

    test('create a new study', async () => {
        const study = await postRest<Study>(
            API_SERVER + '/api/studies',
            SeaBassFishCountStudy,
            adminToken
        );

        const studiesForAdmin = (await getRest<Study[]>(
            API_SERVER + '/api/studies?type=admin',
            adminToken
        )) as any[];
        expect(studiesForAdmin.length).toBe(1);
    });

    test('surveyor should have one study for the new fish count study', async () => {
        const studiesForSurveyor = (await getRest<Study[]>(
            API_SERVER + '/api/studies?type=surveyor',
            adminToken
        )) as any[];
        expect(studiesForSurveyor.length).toBe(1);
    });

    test('admin should see all the surveys saved on their new study', async () => {
        const { study_id: studyId } = SeaBassFishCountStudy;
        const expectedNumberOfSurveys = SeaBassFishCountStudy.surveys.length;
        const studiesForAdmin = (await getRest<Study[]>(
            API_SERVER + '/api/studies?type=admin',
            adminToken
        )) as any[];
        expect(studiesForAdmin[0].surveys.length).toBe(expectedNumberOfSurveys);

        const surveys = (await getRest<Survey[]>(
            API_SERVER + `/api/studies/${studyId}/surveys`,
            adminToken
        )) as any[];
        expect(surveys.length).toBe(expectedNumberOfSurveys);
    });

    test('a surveyor should only be able to see their own surveys', async () => {
        const { study_id: studyId } = SeaBassFishCountStudy;
        const surveys = await getRest<Survey[]>(
            API_SERVER + `/api/studies/${studyId}/surveys`,
            surveyorToken
        );
        expect(surveys.length).toBe(1);
    });

    test('an admin should be able to update a study by adding surveys to it', async () => {
        const { study_id: studyId } = SeaBassFishCountStudy;
        const newSurvey = {
            method: 'analog',
            representation: 'absolute',
            survey_id: 'dca22de2-ac90-4193-8c08-7640afabfd97',
            start_date: '2019-02-05T21:05:55.523Z',
            end_date: '2019-02-05T22:05:55.523Z',
            email: 'sebastian@sidewalklabs.com',
            location_id: 'cddcc8bb-34ce-4442-a3fa-bef0bfc9a120',
            title: 'the additional survey'
        };
        SeaBassFishCountStudy.surveys.push(newSurvey);
        await putRest<Study, any>(
            API_SERVER + `/api/studies/${studyId}`,
            SeaBassFishCountStudy,
            adminToken
        );

        const updatedStudies = (await getRest<Study[]>(
            API_SERVER + `/api/studies?type=admin`,
            adminToken
        )) as any[];
        expect(updatedStudies.length).toBe(1);
        expect(updatedStudies[0].surveys.length).toBe(SeaBassFishCountStudy.surveys.length);
    });

    test('the admin should be able to delete their study making it unavailable from the api', async () => {
        await deleteRest(API_SERVER + '/api/studies/' + SeaBassFishCountStudy.study_id, adminToken);
        await clearLocationsFromApi(API_SERVER, SeaBassFishCountStudy.map, adminToken);
        await expect(
            getRest<Study[]>(
                API_SERVER + '/api/studies/' + SeaBassFishCountStudy.study_id,
                adminToken
            )
        ).rejects.toThrow(ResourceNotFoundError);
    });

    test('post /studies Study[], returns last_updated, created_at fields ', async () => {
        const saveMultipleStudies = [SeaBassFishCountStudy, MarchOnWashington];
        const studies = await postRest<Study[]>(
            API_SERVER + '/api/studies',
            saveMultipleStudies,
            adminToken
        );
        expect(
            studies
                .map(({ created_at, last_updated }) => created_at && last_updated)
                .reduce((acc, curr) => acc && curr)
        ).toBeTruthy();
        const multipleStudies = await getRest<Study[]>(
            API_SERVER + '/api/studies?type=admin',
            adminToken
        );
        expect(multipleStudies.length).toBe(saveMultipleStudies.length);
    });

    test('save data points to a survey if user is a surveyor', async () => {
        const surveyorSurvey = SeaBassFishCountStudy.surveys.filter(({ email }) => {
            return email === surveyorUser.email;
        })[0];
        const { survey_id } = surveyorSurvey;
        //const dataPoint = SeaBassFishCountDataPoints[0]
        await Promise.all(
            SeaBassFishCountDataPoints.map(dataPoint => {
                return postRest<DataPoint>(
                    API_SERVER + `/api/surveys/${survey_id}/datapoints`,
                    dataPoint,
                    surveyorToken
                );
            })
        );
        const dataPoints = await getRest<DataPoint[]>(
            API_SERVER + `/api/surveys/${survey_id}/datapoints`,
            surveyorToken
        );
        expect(dataPoints.length).toBe(SeaBassFishCountDataPoints.length);
    });

    test('saving a data point fails if the user is not signed up for a surveyor', async () => {
        const surveyorSurvey = SeaBassFishCountStudy.surveys.filter(({ email }) => {
            return email === surveyorUser.email;
        })[0];
        const { survey_id } = surveyorSurvey;
        const dataPoint = SeaBassFishCountDataPoints[0];
        await expect(
            postRest<DataPoint>(
                API_SERVER + `/api/surveys/${survey_id}/datapoints`,
                dataPoint,
                adminToken
            )
        ).rejects.toThrow(UnauthorizedError);
    });

    test('we should be able to download all of the users data and it should have the data points nested with the survey', async () => {
        const allStudies = await getRest<Study[]>(API_SERVER + '/api/studies/download', adminToken);

        const { survey_id: surveyorSurveyId } = SeaBassFishCountStudy.surveys.filter(
            ({ email }) => {
                return email === surveyorUser.email;
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
        // @ts-ignore
        expect(surveyorsSurvey.data_points.length).toBe(SeaBassFishCountDataPoints.length);
    });

    test('save another data point', async () => {
        const surveyorSurvey = SeaBassFishCountStudy.surveys.filter(({ email }) => {
            return email === surveyorUser.email;
        })[0];
        const { survey_id } = surveyorSurvey;
        await postRest<DataPoint>(
            API_SERVER + `/api/surveys/${survey_id}/datapoints`,
            SampleDataPointOne,
            surveyorToken
        );

        const dataPoints = await getRest<DataPoint[]>(
            API_SERVER + `/api/surveys/${survey_id}/datapoints`,
            surveyorToken
        );
        expect(
            dataPoints.filter(
                ({ data_point_id }) => data_point_id === SampleDataPointOne.data_point_id
            )
        ).toBeTruthy();
    });

    test('saving the same datapoint id a second time should raise an error', async () => {
        const surveyorSurvey = SeaBassFishCountStudy.surveys.filter(({ email }) => {
            return email === surveyorUser.email;
        })[0];
        const { survey_id } = surveyorSurvey;

        await expect(
            postRest<DataPoint>(
                API_SERVER + `/api/surveys/${survey_id}/datapoints`,
                SampleDataPointOne,
                surveyorToken
            )
        ).rejects.toThrowError();
    });

    test('remove the surveyor we have been using from the surveyors list', async () => {
        const surveyorSurvey = SeaBassFishCountStudy.surveys.filter(({ email }) => {
            return email === surveyorUser.email;
        })[0];
        const { survey_id } = surveyorSurvey;

        const { email: surveyorEmail } = surveyorUser;
        const updatedSurveyors = SeaBassFishCountStudy.surveyors.filter(
            email => email !== surveyorEmail
        );

        const dataPointsA = await getRest<DataPoint[]>(
            API_SERVER + `/api/surveys/${survey_id}/datapoints`,
            surveyorToken
        );

        // remove the surveyor from the study
        await putRest<string[], any>(
            API_SERVER + `/api/studies/${SeaBassFishCountStudy.study_id}/surveyors`,
            updatedSurveyors,
            adminToken
        );

        // the surveyor should no longer be able to save data points
        await expect(
            getRest<DataPoint[]>(
                API_SERVER + `/api/studies/${SeaBassFishCountStudy.study_id}/datapoints`,
                surveyorToken
            )
        ).rejects.toThrow(UnauthorizedError);

        // the data points they had previously saved should still be saved to the study
        const dataPoints = await getRest<DataPoint[]>(
            API_SERVER + `/api/studies/${SeaBassFishCountStudy.study_id}/datapoints`,
            adminToken
        );

        // not a great test, for it to be meaningful only the surveyor should be adding datapoints
        expect(dataPoints.length).toBeGreaterThan(0);
    });

    test('once a user logout out using a token, the token should result in a 401', async () => {
        await postRest<{}>(API_SERVER + '/auth/logout', {}, surveyorToken);
        await expect(
            getRest<Study[]>(API_SERVER + '/api/studies?type=surveyor', surveyorToken)
        ).rejects.toThrow(UnauthorizedError);
    });
});
