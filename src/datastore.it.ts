import * as dotenv from 'dotenv';
import * as pg from 'pg';
import * as uuidv4 from 'uuid/v4';

import { addDataPointToSurveyNoStudyId, addDataPointToSurveyWithStudyId, getTablenameForSurveyId, createLocation, createStudy, createNewSurveyForStudy, createUser, deleteDataPoint, Location, Study, Survey, User, giveUserStudyAcess } from './datastore';

dotenv.config();

// @ts-ignore: global variable
const host = process.env.db_host;
// @ts-ignore: global variable
const dbUser = process.env.db_user;
// @ts-ignore: global variable
const dbPass = process.env.db_pass;
// @ts-ignore: global variables
const dbName = process.env.db_name;
// @ts-ignore: global variables
const dbPort = parseInt(process.env.db_port);

const pool = new pg.Pool({
    max: 1,
    host: host,
    user: dbUser,
    password: dbPass,
    database: dbName,
    port: dbPort
});

const sebastian: User = {
    userId: uuidv4(),
    email: 'sebastian@sidewalklabs.com',
    name: 'Eric Sebastian'
}

const sebastian2: User = {
    userId: uuidv4(),
    email: 'sebastian@sidewalklabs.com',
    name: 'Eric Sebastian'
}

const thorncliffeParkStudy: Study = {
    title: 'Thornecliffe Park',
    studyId: uuidv4(),
    protocolVersion: '1.0',
    userId: sebastian.userId,
}
const simpleStudy: Study = {
    title: 'Thornecliffe Park',
    studyId: uuidv4(),
    protocolVersion: '1.0',
    userId: sebastian.userId,
}

const simpleStudyInvalidUserId: Study = {
    title: 'Thornecliffe Park and Sabina Ali Study',
    studyId: uuidv4(),
    protocolVersion: '1.0',
    userId: uuidv4(),
}

const location: Location = {
    "locationId": "07ab155a-2b38-44a7-ad73-b6711b3d46b9",
    "country": "canada",
    "city": "Toronto",
    "namePrimary": "Zone 3",
    "subdivision": "west",
    "geometry": {
        "type": "Polygon",
        "coordinates": [
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
        ]
    }
}

const surveyNearGarbage: Survey = {
    studyId: thorncliffeParkStudy.studyId,
    locationId: uuidv4(),
    surveyId: uuidv4(),
    startDate: '2018-09-14T17:00:00Z',
    endDate: '2018-09-14T19:00:00Z',
    representation: 'absolute',
    method: 'analog',
    userEmail: sebastian.email
}

async function seedDatabase() {
    const { rowCount, command } = await createUser(pool, sebastian);
    const [studyPgResult, newTablePgResult] = await createStudy(pool, thorncliffeParkStudy, ['gender', 'location']);
}

test('save new user', async () => {
    const { rowCount, command } = await createUser(pool, sebastian);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('saving user with duplicate email errors', async () => {
    await expect(createUser(pool, sebastian2))
        .rejects
        .toThrowError('duplicate key value violates unique constraint "users_email_key"');
});

test('save new study', async () => {
    const [studyPgResult, newTablePgResult] = await createStudy(pool, simpleStudy, ['gender', 'location']);

    let { rowCount, command } = studyPgResult;
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
    expect(newTablePgResult.command).toBe('CREATE');
});

test('save new study with all possible fields', async () => {
    const [studyPgResult, newTablePgResult] = await createStudy(pool, thorncliffeParkStudy, ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location', 'note']);

    let { rowCount, command } = studyPgResult;
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
    expect(newTablePgResult.command).toBe('CREATE');
});

test('save location', async () => {
    const { rowCount, command } = await createLocation(pool, location);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('saving study with a nonexistent user errors', async () => {
    await expect(createStudy(pool, simpleStudyInvalidUserId, ['gender', 'location']))
        .rejects
        .toThrowError('insert or update on table "study" violates foreign key constraint "study_user_id_fkey"');
});

test('authorize a user to be a surveyor for a study based off their email', async () => {
    const [res, userId] = await giveUserStudyAcess(pool, sebastian.email, thorncliffeParkStudy.studyId);
    const { rowCount, command } = res as pg.QueryResult;
    expect(userId).toBe(null);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('create new user if added to study without existsing account', async () => {
    const [res, userId] = await giveUserStudyAcess(pool, 'authorizedNonPreviouslyExisitingUser@nowhere.io', thorncliffeParkStudy.studyId);
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

test('can save a data point', async () => {
    const dataPoint = {
        "location": {
            "latitude": "43.70396934170554",
            "longitude": "-79.3432493135333"
        },
        "object": "pushcart",
        "posture": "sitting",
        "data_point_id": uuidv4()
    }
    const { rowCount, command } = await addDataPointToSurveyWithStudyId(pool, surveyNearGarbage.studyId, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});


test('add a data point using only the survey id', async () => {
    const dataPoint = {
        "data_point_id": uuidv4(),
        "gender": "male",
        "groups": "pair",
        "location": {
            "latitude": "43.70416809098892",
            "longitude": "-79.34354536235332"
        },
        "mode": "pedestrian",
        "object": "luggage",
        "posture": "leaning"
    };
    const { rowCount, command } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
});

test('update a data point using it\'s own id', async () => {
    const dataPointId = uuidv4()
    const dataPoint = {
        "data_point_id": dataPointId,
        "location": {
            "latitude": "43.70416809098892",
            "longitude": "-79.34354536235332"
        },
        "posture": "leaning"
    };
    const dataPointUpdated = {
        "data_point_id": dataPointId,
        "gender": "female",
        "groups": "pair",
        "location": {
            "latitude": "43.70416809098892",
            "longitude": "-79.34354536235332"
        },
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
        "data_point_id": uuidv4(),
        "location": {
            "latitude": "43.70416809098892",
            "longitude": "-79.34354536235332"
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
        "data_point_id": uuidv4(),
        "location": {
            "latitude": "43.70416809098892",
            "longitude": "-79.34354536235332"
        },
        "activities": ["commercial", "recreation_active", "electronic_engagement"],
        "posture": "leaning"
    }
    const { rowCount, command } = await addDataPointToSurveyNoStudyId(pool, surveyNearGarbage.surveyId, dataPoint);
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');


});

test('delete a data point', async () => {
    const dataPointId = uuidv4();
    const dataPoint = {
        "data_point_id": dataPointId,
        "location": {
            "latitude": "43.70416809098892",
            "longitude": "-79.34354536235332"
        },
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
})

afterAll(async () => {
    try {
        await pool.end();
    } catch (error) {
        console.error(`${error}`);
    }
});
