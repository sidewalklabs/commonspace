import * as dotenv from 'dotenv';
import { Polygon } from 'geojson';
import * as pg from 'pg';
import * as uuid from 'uuid';

import { addDataPointToSurveyNoStudyId, addDataPointToSurveyWithStudyId, deleteDataPoint, retrieveDataPointsForSurvey } from './datapoint';
import { checkUserIdIsSurveyor, createStudy, deleteStudy, giveUserStudyAccess, Study } from './study';
import { createNewSurveyForStudy, Survey } from './survey';
import { authenticateOAuthUser, createUser, User } from './user';

import { createLocation, Location } from './location';

dotenv.config();

// @ts-ignore: global variable
const host = process.env.DB_HOST;
// @ts-ignore: global variable
const dbUser = process.env.DB_USER;
// @ts-ignore: global variable
const dbPass = process.env.DB_PASS;
// @ts-ignore: global variables
const dbName = process.env.DB_NAME;
// @ts-ignore: global variables
const dbPort = parseInt(process.env.DB_PORT);

const pool = new pg.Pool({
    max: 1,
    host: host,
    user: dbUser,
    password: dbPass,
    database: dbName,
    port: dbPort
});

const sebastian: User = {
    userId: uuid.v4(),
    email: 'sebastian@sidewalklabs.com',
    name: 'Eric Sebastian',
    password: 'password'
}

const sebastian2: User = {
    userId: uuid.v4(),
    email: 'sebastian@sidewalklabs.com',
    name: 'Eric Sebastian',
    password: 'password'
}

const thorncliffeParkStudy: Study = {
    title: 'Thorncliffe Park',
    type: 'stationary',
    studyId: uuid.v4(),
    protocolVersion: '1.0',
    fields: ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'object', 'location'],
    userId: sebastian.userId,
    location: 'Thorncliffe Park'
}
const simpleStudy: Study = {
    title: 'Thorncliffe Park',
    type: 'stationary',
    studyId: uuid.v4(),
    protocolVersion: '1.0',
    fields: ['gender', 'location'],
    userId: sebastian.userId,
    location: 'Thorncliffe Park'
}

const simpleStudyInvalidUserId: Study = {
    title: 'Thorncliffe Park and Sabina Ali Study',
    type: 'stationary',
    studyId: uuid.v4(),
    protocolVersion: '1.0',
    fields: ['gender', 'location'],
    userId: uuid.v4(),
    location: 'Thorncliffe Park'
}

const locatoinPolygon: Polygon = {
    "type": "Polygon",
    "coordinates": [[
        [
            -79.34435606002809,
            43.70395407191628
        ],
        [
            -79.34425145387651,
            43.70387845004543
        ],
        [
            -79.34404492378236,
            43.70362637645357
        ],
        [
            -79.3438357114792,
            43.70356820547418
        ],
        [
            -79.34322685003282,
            43.703548815135164
        ],
        [
            -79.34306591749193,
            43.70346931467964
        ],
        [
            -79.3434950709343,
            43.70313967751972
        ],
        [
            -79.34463769197465,
            43.70377955976265
        ]
    ]]
}

const location = {
    "locationId": "07ab155a-2b38-44a7-ad73-b6711b3d46b9",
    "country": "canada",
    "city": "Toronto",
    "namePrimary": "Zone 3",
    "subdivision": "west",
    "geometry": locatoinPolygon
}

const surveyNearGarbage: Survey = {
    studyId: thorncliffeParkStudy.studyId,
    locationId: uuid.v4(),
    surveyId: uuid.v4(),
    startDate: '2018-09-14T17:00:00Z',
    endDate: '2018-09-14T19:00:00Z',
    representation: 'absolute',
    method: 'analog',
    userEmail: sebastian.email
}

async function seedDatabase() {
    await createUser(pool, sebastian);
    await createStudy(pool, thorncliffeParkStudy);
}

// test('save new user', async () => {
//     expect(async () => await createUser(pool, sebastian)).not.toThrowError();
// })

test('saving user with duplicate email errors', async () => {
    await expect(createUser(pool, sebastian2))
        .rejects
        .toThrowError('duplicate key value violates unique constraint "users_email_key"');
});

test('saving user with an OAuth account, should return the same value whether users exists or not', async () => {
    const user1 = await authenticateOAuthUser(pool, 'test@gmail.com');
    const user2 = await authenticateOAuthUser(pool, 'test@gmail.com');
    expect(user1.userId).toEqual(user2.userId);
});

// test('save new study', async () => {
//     const [studyPgResult, newTablePgResult] = await createStudy(pool, simpleStudy);

//     let { rowCount, command } = studyPgResult;
//     expect(rowCount).toBe(1);
//     expect(command).toBe('INSERT');
//     expect(newTablePgResult.command).toBe('CREATE');
// });

// test('save new study with all possible fields', async () => {
//     const [studyPgResult, newTablePgResult] = await createStudy(pool, thorncliffeParkStudy, );

//     let { rowCount, command } = studyPgResult;
//     expect(rowCount).toBe(1);
//     expect(command).toBe('INSERT');
//     expect(newTablePgResult.command).toBe('CREATE');
// });

test('save location', async () => {
    const { rowCount, command } = await createLocation(pool, location);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('saving study with a nonexistent user errors', async () => {
    await expect(createStudy(pool, simpleStudyInvalidUserId))
        .rejects
        .toThrowError('insert or update on table "study" violates foreign key constraint "study_user_id_fkey"');
});

test('authorize a user to be a surveyor for a study based off their email', async () => {
    const [res, userId] = await giveUserStudyAccess(pool, sebastian.email, thorncliffeParkStudy.studyId);
    const { rowCount, command } = res as pg.QueryResult;
    expect(userId).toBe(null);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('create new user if added to study without existsing account', async () => {
    const [res, userId] = await giveUserStudyAccess(pool, 'authorizedNonPreviouslyExisitingUser@nowhere.io', thorncliffeParkStudy.studyId);
    const { rowCount, command } = res as pg.QueryResult;
    expect(userId).toBeTruthy();
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('save new survey', async () => {
    const { rowCount, command } = await createNewSurveyForStudy(pool, surveyNearGarbage);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('verify a user has access to a survey', async () => {
    const { userId } = sebastian;
    const { surveyId } = surveyNearGarbage;
    const shouldBeTrue = await checkUserIdIsSurveyor(pool, userId, surveyId);
    expect(shouldBeTrue).toEqual(true);
});

test('can save a data point', async () => {
    const dataPoint = {
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "creation_date": "2018-03-11T15:04:54.892Z",
        "object": "pushcart",
        "posture": "sitting",
        "data_point_id": uuid.v4()
    }
    const { rowCount, command } = await addDataPointToSurveyWithStudyId(pool, surveyNearGarbage.studyId, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('can save another data point', async () => {
    const dataPoint = {
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "creation_date": "2018-03-11T15:04:54.892Z",
        "object": "pushcart",
        "posture": "sitting",
        "data_point_id": uuid.v4()
    }
    const { rowCount, command } = await addDataPointToSurveyWithStudyId(pool, surveyNearGarbage.studyId, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
})


test('add a data point using only the survey id', async () => {
    const dataPoint = {
        "data_point_id": "ecc12073-51ae-42fa-b63f-459d95ee4d68",
        "gender": "male",
        "age": null,
        "mode": null,
        "posture": null,
        "activities": null,
        "groups": null,
        "object": null,
        "note": null,
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "color": "#F44336",
        "title": "Person 0",
        "survey_id": "ff41212b-98fd-48c6-a84c-1eb927a3a5fc"
    };
    const { rowCount, command } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('update a data point using it\'s own id', async () => {
    const dataPointId = uuid.v4()
    const dataPoint = {
        "data_point_id": dataPointId,
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "creation_date": "2018-03-11T15:04:54.892Z",
        "posture": "leaning"
    };
    const dataPointUpdated = {
        "data_point_id": dataPointId,
        "gender": "female",
        "groups": "pair",
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "last_updated": "2018-03-11T18:04:54.892Z",
        "mode": "pedestrian",
        "object": "luggage",
        "posture": "sitting",
        "note": "sitting pedestrian, I guess pigs can fly"
    }
    const { rowCount, command } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');

    const { rowCount: rc, command: com } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPointUpdated);
    expect(rc).toBe(1);
    expect(com).toBe('INSERT');
})

test('save a data point with a single activity', async () => {
    const dataPoint = {
        "data_point_id": uuid.v4(),
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "age": "child",
        "activities": "commercial",
        "posture": "leaning"
    };
    const { rowCount, command } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('save a data point with multiple activities', async () => {
    const dataPoint = {
        "data_point_id": uuid.v4(),
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "creation_date": "2018-03-11T15:04:54.892Z",
        "activities": ["commercial", "recreation_active", "electronic_engagement"],
        "posture": "leaning"
    }
    const { rowCount, command } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');


});

test('delete a data point', async () => {
    const dataPointId = uuid.v4();
    const dataPoint = {
        "data_point_id": dataPointId,
        "location": {
            "coordinates": [-74.001327, 40.752675],
            "type": "Point"
        },
        "creation_date": "2018-03-11T15:04:54.892Z",
        "age": "child",
        "activities": "commercial",
        "posture": "leaning"
    };
    const { rowCount: rowCountAdd, command: commandAdd } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCountAdd).toBe(1);
    expect(commandAdd).toBe('INSERT');
    const { rowCount: rowCountDelete, command: commandDelete } = await deleteDataPoint(pool, surveyNearGarbage.surveyId, dataPointId);
    expect(rowCountDelete).toBe(1);
    expect(commandDelete).toBe('DELETE');
});

test('delete a study after throwing information for it into the database', async () => {
    expect(async () => await deleteStudy(pool, thorncliffeParkStudy.studyId)).not.toThrowError();
})

test('fetch the datapoints that are currently in the database', async () => {
    expect(async () => await retrieveDataPointsForSurvey(pool, thorncliffeParkStudy.studyId)).not.toThrowError();
});

afterAll(async () => {
    try {
        await pool.end();
    } catch (error) {
        console.error(`${error}`);
    }
});
