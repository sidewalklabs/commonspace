import camelcaseKeys from 'camelcase-keys';
import { FeatureCollection } from 'geojson';
import path from 'path';
import fetch from "node-fetch";

import { adminUser, surveyorUser, SeaBassFishCountStudy, MarchOnWashington } from './integration_test_data'
import { Study, Survey } from './routes/api'
import { snakecasePayload } from './utils'
import dotenv from 'dotenv';
import { deleteLocation } from './datastore/location';
import { deleteStudiesForUserId } from './datastore/study';
dotenv.config({ path: process.env.DOTENV_CONFIG_DIR ? path.join(process.env.DOTENV_CONFIG_DIR, '.env') : 'config/integration.env'});

const { INTEGRATION_TEST_SERVER: API_SERVER  = '' } = process.env

interface User {
    email: string;
    password: string;
}


const fetchParams: RequestInit = {
    //mode: "sam", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
}

class ResourceNotFoundError extends Error {}
export async function deleteRest(route: string, token?: string): Promise<void> {
    try {
        const params = {
            ...fetchParams,
            method: "DELETE",
            headers: {}
        }
        const uri = API_SERVER + route;
        if (token) {
            params.headers['Authorization'] = `bearer ${token}`;
        }
        const response = await fetch(uri, params)
        if (response.status === 404) {
            throw new ResourceNotFoundError(`Resource not found ${uri}`)
        } else if (response.status !== 200) {
            throw Error(`${response.status} ${response.statusText}`);
        }
        return;
    } catch (err) {
        console.error(`[route ${route}] ${err}`)
        throw err;
    }
}

export async function postRestNoBody(route: string, data: any, token?:string): Promise<void> {
    const body = JSON.stringify(snakecasePayload(data));
    try {
        const params = {
            ...fetchParams,
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body
        }
        if (token) {
            params.headers['Authorization'] = `bearer ${token}`;
        }
        const response = await fetch(API_SERVER + route, params)
        if (response.status !== 200) {
            throw Error(`${response.status} ${response.statusText}`);
        }
        return;
    } catch (err) {
        console.error(`[route ${route}] [data ${body}] ${err}`)
        throw err;
    }
}

export async function postRest(route: string, data: any, token?: string) {
    const body = JSON.stringify(snakecasePayload(data));
    try {
        const params = {
            ...fetchParams,
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body
        }
        if (token) {
            params.headers['Authorization'] = `bearer ${token}`;
        }
        const response = await fetch(API_SERVER + route, params)
        if (response.status !== 200) {
            throw Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
    } catch (err) {
        console.error(`[route ${route}] [data ${body}] ${err}`)
        throw err;
    }
}

async function clearLocations(fc: FeatureCollection, token: string): Promise<void> {
    try {
        await Promise.all(fc.features.map(async ({properties}) => {
            try {
                await deleteRest(`/api/locations/${properties.location_id}`, token)
            } catch (error) {
                // it's okay if it doesn't exist yet
                return
            }
        }))
    } catch (error) {
        if (!(error instanceof ResourceNotFoundError)) {
            throw error;
        }
    }
}

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
    await Promise.all(maps.map( m => clearLocations(m, token)))
    try {
        await deleteRest('/api/user', token)
    } catch (error) {
        if (!(error instanceof ResourceNotFoundError)) {
            throw error;
        }
    }
}

class UnauthorizedError extends Error {}
class ResourceDoesNotExistError extends Error {}

async function getRest<T>(route: string, token?: string): Promise<T> {
    const uri =  API_SERVER + route;
    const params = {
        ...fetchParams,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    }
    if (token) {
        params.headers['Authorization'] = `bearer ${token}`;
    }
    const response = await fetch(
        uri,
        params,
    );
    if (response.status === 404) {
        throw new ResourceDoesNotExistError(`Resource not found: ${route}`)
    }
    if (response.status === 401) {
        throw new UnauthorizedError(`Not Authorized: ${route}`)
    }
    if (response.status !== 200) {
        throw new Error(`Status: ${response.status}, could not fetch get ${uri}`);
    }
    const body = await response.json();
    return body as T;
}

async function getStudiesForAdmin(token?: string) {
    const params = {
        ...fetchParams,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    }
    if (token) {
        params.headers['Authorization'] = `bearer ${token}`;
    }
    
    const response = await fetch(
        API_SERVER + '/api/studies?type=admin',
        params,
    );
    if (response.status !== 200) {
        throw new Error('Could not fetch get studies');
    }
    const body = await response.json();
    return camelcaseKeys(body);
}

// warning this version of loginJwt swallows the error, assumes user doesn't exist
async function loginJwt(user: User) {
    const uri = API_SERVER + `/auth/login`;
    const requestBody = JSON.stringify(user);
    const fetchParams = {
        method: 'Post',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: 'application/bearer.token+json'
        },
        body: requestBody
    }
    try {
        const response = await fetch(uri, fetchParams)
        if (response.status === 401) {
            throw new Error(`not able to login user: ${JSON.stringify(user)}`)
        }
        const responseBody = await response.json()
        return responseBody as {token: string};
    } catch (error) {
        console.error(`[uri ${uri}][params ${JSON.stringify(fetchParams)}] ${error}`);
        return;
    }
}

async function login(user: User) {
    const uri = `${API_SERVER}/auth/login`
    const { headers } = await postRest(uri, user);
    const [keyValue, path, expires] = headers.get('set-cookie').split(';');
    const [key, token] = keyValue.split('=');
    return token;
}

async function signupJwt(user: User) {
    const uri = `${API_SERVER}/auth/signup`
    const requestBody = JSON.stringify(user)
    const fetchParams = {
        method: 'Post',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: 'application/bearer.token+json'
        },
        body: requestBody
    }

    const response = await fetch(uri, fetchParams)
    const responseBody = await response.json()
    return responseBody;
}

async function checkNumberOfSurveysOnStudyForToken(studyId: string, expected: number, token: string) {
    const surveys = await getRest<Survey[]>(`/api/studies/${studyId}/surveys`, token);
    if (surveys.length !== expected) {
        const nSurveys = surveys.length;
        throw new Error('Incorrect number of surveys, expected ${expected}, received ${nSurveys}');
    }
}

async function runTest(adminUser, surveyorUser) {
    // we expect an authoization error if we don't yet have an authentication token
    try {
        await getRest('/api/studies?type=surveyor');
        throw new Error('api returning response without client sending an authentication token');
    } catch (error) {
        if (!(error instanceof UnauthorizedError)) {
            throw error;
        }
    }

    const { token: adminToDeleteToken } = await loginJwt(adminUser);
    if (adminToDeleteToken) {
        await clearUserFromApp([SeaBassFishCountStudy.map, MarchOnWashington.map], adminToDeleteToken);
    }
    const { token: surveyorToken } = await loginJwt(surveyorUser);
    if (!surveyorToken) throw new Error('unable to login surveyor!, check username and password');
    const { token: adminToken } = await signupJwt(adminUser);
    if (!adminToken) throw new Error('unable to login admin!, check username and password');

    const study = await postRest('/api/studies', SeaBassFishCountStudy, adminToken);

    const studiesForSurveyor = await getRest('/api/studies?type=surveyor', adminToken) as Study[];
    if (studiesForSurveyor.length !== 1) {
        throw new Error('Incorrect number of studies returned')
    }
    if (studiesForSurveyor[0].surveys.length !== 1) {
        const { title } = studiesForSurveyor[0];
        throw new Error(`Incorrect number of surveys returned for study: ${title} and user: ${adminUser.email}`)
    }
    const studiesForAdmin = await getRest('/api/studies?type=admin', adminToken) as Study[];
    if (studiesForAdmin[0].surveys.length !== SeaBassFishCountStudy.surveys.length) {
        throw new Error(`Incorrect number of surveys on study ${SeaBassFishCountStudy.study_id} returned for admin ${adminUser.email}, received ${studiesForAdmin.length}, expected ${SeaBassFishCountStudy.surveys.length}`)
    }

    // we want to make sure that the user only sees their own surveys when they ask for a study's surveys
    try {
        checkNumberOfSurveysOnStudyForToken(SeaBassFishCountStudy.study_id, 1, surveyorToken);
    } catch (error) {
        throw new Error(`[study-title ${SeaBassFishCountStudy.title}][user ${JSON.stringify(surveyorUser)}] ${error}`)
    }


    try {
        checkNumberOfSurveysOnStudyForToken(SeaBassFishCountStudy.study_id, SeaBassFishCountStudy.surveys.length, adminToken);
    } catch (error) {
        throw new Error(`[study-title ${SeaBassFishCountStudy.title}][user ${JSON.stringify(surveyorUser)}] ${error}`)
    }

    // however if they're the admin they should see all of the surveys on the study
    const surveysForStudyAssignedToAdmin = await getRest(`/api/studies/${SeaBassFishCountStudy.study_id}/surveys`, adminToken) as Survey[];

    const newStudy = await getRest<Study>(`/api/studies/${SeaBassFishCountStudy.study_id}`, adminToken);
    if (newStudy.study_id !== SeaBassFishCountStudy.study_id) {
        throw new Error(`Recently saved study not what was expected, recieved: ${JSON.stringify(newStudy)}`)
    }

    // delete the study
    await deleteRest('/api/studies/' + SeaBassFishCountStudy.study_id, adminToken);
    await clearLocations(SeaBassFishCountStudy.map, adminToken)

    try {
        await getRest< Study > ('/api/studies/' + SeaBassFishCountStudy.study_id, adminToken);
        throw new Error(`trying to delete study with id ${SeaBassFishCountStudy.study_id} should throw error after being successfully deleted`);
    } catch (error) {
        if (!(error instanceof ResourceDoesNotExistError)) {
            throw new Error(`study for id: ${SeaBassFishCountStudy.study_id} should not exist after delete`)
        }
    }

    const saveMultipleStudies = [SeaBassFishCountStudy, MarchOnWashington]
    await postRest('/api/studies', saveMultipleStudies, adminToken);
    const multipleStudies = await getRest< Study[] >('/api/studies?type=admin', adminToken);
    if (multipleStudies.length !== saveMultipleStudies.length) {
        throw new Error(`Expecting ${saveMultipleStudies.length} studies for the admin user at this point, received: ${multipleStudies.length}` )
    }

    // the user's token should no longer be valid after logging out
    await postRestNoBody('/auth/logout', {}, surveyorToken);
    try {
        await getRest('/api/studies?type=surveyor', surveyorToken);
        throw new Error('api returning response after logout');
    } catch (error) {
        if (!(error instanceof UnauthorizedError)) {
            throw error;
        }
    }
}

runTest(adminUser, surveyorUser)
    .then(() => console.log('success'))
    .catch( error => {
        console.error(error.message);
        process.exit(-1);
    })
