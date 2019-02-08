import camelcaseKeys from 'camelcase-keys';
import { Feature, FeatureCollection } from 'geojson';
import path from 'path';
import fetch from "node-fetch";

import { snakecasePayload } from './utils'
import * as dotenv from 'dotenv';
import { deleteLocation } from './datastore/location';
import { deleteStudiesForUserId } from './datastore/study';
import { IdDoesNotExist as UserIdDoesNotExist } from './datastore/user';
dotenv.config({ path: process.env.DOTENV_CONFIG_DIR ? path.join(process.env.DOTENV_CONFIG_DIR, '.env') : 'config/integration.env'});

interface User {
    email: string;
    password: string;
}

const { INTEGRATION_TEST_SERVER: API_SERVER, INTEGRATION_TEST_PASSWORD, INTEGRATION_TEST_USER } = process.env;

const user = {
    email: INTEGRATION_TEST_USER,
    password: INTEGRATION_TEST_PASSWORD
}

const SeaBassFishCountConfig = {
    studyId: "b243745c-f106-4f1c-98e2-f0b2ade1baf5"
}

const kelpForestConfig = {
    locationId: "cce59ff5-5751-4278-beeb-0b81784d1d8a"
}

const southEndCoveConfig = {
    locationId: "cddcc8bb-34ce-4442-a3fa-bef0bfc9a120"
}

const releasetheseabassSurvey = {
    "method": "analog",
    "representation": "absolute",
    "survey_id": "4bfb8cde-903b-4a96-98ce-716403e7e5bc",
    "start_date": "2019-02-05T21:04:33.221Z",
    "end_date": "2019-02-05T22:04:33.224Z",
    "surveyor_email": "releasetheseabass@gmail.com",
    "location_id": "cce59ff5-5751-4278-beeb-0b81784d1d8a",
    "title": "swing shift"
}
const sebastianSurvey =    {
    "method": "analog",
    "representation": "absolute",
    "survey_id": "dcb61274-3979-4852-a1e0-05bfc06fb61c",
    "start_date": "2019-02-05T21:05:55.523Z",
    "end_date": "2019-02-05T22:05:55.523Z",
    "surveyor_email": "sebastian@sidewalklabs.com",
    "location_id": "cce59ff5-5751-4278-beeb-0b81784d1d8a",
    "title": "late late shift"
}
const pandanantaSurvey =    {
    "method": "analog",
    "representation": "absolute",
    "survey_id": "0f62328e-1d99-43a6-9de5-11ec6003d76a",
    "start_date": "2019-02-05T21:05:56.559Z",
    "end_date": "2019-02-05T22:05:56.559Z",
    "surveyor_email": "pandananta@gmail.com",
    "location_id": "cce59ff5-5751-4278-beeb-0b81784d1d8a",
    "title": "panda panda panda"
}
const mhtSurvey = {
    "method": "analog",
    "representation": "absolute",
    "survey_id": "facab2d0-22fb-49b0-904b-795501142aa7",
    "start_date": "2019-02-05T21:05:57.284Z",
    "end_date": "2019-02-05T22:05:57.284Z",
    "surveyor_email": "mht@sidewalklabs.com",
    "location_id": "cce59ff5-5751-4278-beeb-0b81784d1d8a",
    "title": "mht airport"
}
const mattSurvey = {
    "method": "analog",
    "representation": "absolute",
    "survey_id": "7251f996-ade0-49cb-88c5-ef149baa14e7",
    "start_date": "2019-02-05T21:06:05.895Z",
    "end_date": "2019-02-05T22:06:05.895Z",
    "surveyor_email": "matt@sidewalklabs.com",
    "location_id": "cce59ff5-5751-4278-beeb-0b81784d1d8a",
    "title": "the breuer experience"
}
const interfacedSurvey = {
    "method": "analog",
    "representation": "absolute",
    "survey_id": "2ddbe79b-5132-4559-8987-930c90b6a26a",
    "start_date": "2019-02-05T21:06:09.837Z",
    "end_date": "2019-02-05T22:06:09.837Z",
    "surveyor_email": "interfaced@gmail.com",
    "location_id": "cce59ff5-5751-4278-beeb-0b81784d1d8a",
    "title": "this is patrick"
}

const kelpForest: Feature =  {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
              [
                -117.27291967192288,
                32.850977041594874
              ],
              [
                -117.27319555637224,
                32.85076845176209
              ],
              [
                -117.27306987562771,
                32.85060363985181
              ],
              [
                -117.27273881435396,
                32.85065514357228
              ],
              [
                -117.27291967192288,
                32.850977041594874
              ]
        ]]
    },
    "properties": {
        "name": "Kelp Forest",
        "location_id": kelpForestConfig.locationId
    }
}

const southEndCove: Feature = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
              [
                -117.27223992347719,
                32.85042273262966
              ],
              [
                -117.27284073829652,
                32.85032487512764
              ],
              [
                -117.27285913068046,
                32.85018066365812
              ],
              [
                -117.27245450019838,
                32.8502218672734
              ],
              [
                -117.27223992347719,
                32.85042273262966
              ]
        ]]
    },
    "properties": {
        "name": "Cove -- South End",
        "location_id": southEndCoveConfig.locationId
    }
}

const laJollaBeach: FeatureCollection = {
    type: 'FeatureCollection',
    features: [kelpForest, southEndCove]
}

const SeaBassFishCountStudy = {
    "study_id": SeaBassFishCountConfig.studyId,
    "title": "Sea Bass Fish Count",
    "author": "californianseabass",
    "author_url": "github.com/californianseabass",
    "description": "Help Sea Bass count his underwater friends!",
    "location": "La Jolla Cove, San Diego",
    "protocol_version": "1.0",
    "type": "stationary",
    fields: [
        "gender",
        "age",
        "posture",
        "notes"
    ],
    surveyors: [
        "mht@sidewalklabs.com",
        "interfaced@gmail.com",
        "matt@sidewalklabs.com",
        "pandananta@gmail.com",
        "sebastian@sidewalklabs.com",
        "releasetheseabass@gmail.com"
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
                if (!(error instanceof ResourceNotFoundError)) {
                    throw error;
                }
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
async function clearUserFromApp(map: FeatureCollection, token: string) {
    await clearLocations(map, token)
    try {
        await deleteRest('/api/user', token)
    } catch (error) {
        if (!(error instanceof ResourceNotFoundError)) {
            throw error;
        }
    }
}

class UnauthorizedError extends Error {}

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
    if (response.status === 401) {
        throw new UnauthorizedError(`Not Authorized: ${route}`)
    }
    if (response.status !== 200) {
        throw new Error(`Status: ${response.status}, could not fetch get ${uri}`);
    }
    const body = await response.json();
    return camelcaseKeys(body) as T;
}

async function getStudiesForSurveyor(token?: string)  {
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
        API_SERVER + '/api/studies?type=surveyor',
        params,
    );
    if (response.status !== 200) {
        throw new Error('Could not fetch get studies');
    }
    const body = await response.json();
    return camelcaseKeys(body);
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
    const requestBody = JSON.stringify(user)
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

async function runTest(user) {
    const loginResponse = await loginJwt(user);
    if (loginResponse) {
        await clearUserFromApp(SeaBassFishCountStudy.map, loginResponse.token);
    }
    const {token } = await signupJwt(user);
    const study = await postRest('/api/studies', SeaBassFishCountStudy, token);
    const studiesForSurveyor = await getStudiesForSurveyor(token);
    if (studiesForSurveyor.length !== 1) {
        throw new Error('Incorrect number of studies returned')
    }
    if (studiesForSurveyor[0].surveys.length !== 1) {
        const { title } = studiesForSurveyor[0];
        throw new Error(`Incorrect number of surveys returned for study: ${title} and user: ${user.email}`)
    }
    const studiesForAdmin = await getStudiesForAdmin(token);
    if (studiesForAdmin.length !== SeaBassFishCountStudy.surveys.length) {
        throw new Error(`Incorrect number of studies returned for admin ${user.email}, received ${studiesForAdmin.length}, expected ${SeaBassFishCountStudy.surveys.length}`)
    }

    const newStudy = await getRest<{studyId: string}>(`/api/studies/${SeaBassFishCountStudy.study_id}`, token);
    if (newStudy.studyId !== SeaBassFishCountStudy.study_id) {
        throw new Error(`Recently saved study not what was expected, recieved: ${JSON.stringify(newStudy)}`)
    }
}

runTest(user)
    .then(() => console.log('done'))
    .catch( error => {
        console.error(error.message)
        process.exit(-1)
    })
