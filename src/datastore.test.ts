import * as dotenv from 'dotenv';
import * as pg from 'pg';
import * as uuidv4 from 'uuid/v4';

import { createStudy, createUser, giveUserSurveyAcess, Study, User, giveUserStudyAcess } from './datastore';

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

const studyFields = ['gender', 'location'];

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

test('save new study', async () => {
    const [studyPgResult, newTablePgResult] = await createStudy(pool, thorncliffeParkStudy, ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location']);

    let { rowCount, command } = studyPgResult;
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
    expect(newTablePgResult.command).toBe('CREATE');
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
})
