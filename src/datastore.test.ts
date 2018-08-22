import * as dotenv from 'dotenv';
import * as pg from 'pg';
import * as uuidv4 from 'uuid/v4';

import { createStudy, createUser, giveUserSurveyAcess, Study, User } from './datastore';

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

const thorncliffeParkStudyInvalidUserId: Study = {
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
    const [studyPgResult, newTablePgResult] = await createStudy(pool, thorncliffeParkStudy, ['gender', 'location']);

    let { rowCount, command } = studyPgResult;
    expect(rowCount).toBe(1);
    expect(command).toBe('INSERT');
    expect(newTablePgResult.command).toBe('CREATE');
});

test('saving study with a nonexistent user errors', async () => {
    await expect(createStudy(pool, thorncliffeParkStudyInvalidUserId, ['gender', 'location']))
        .rejects
        .toThrowError('insert or update on table "study" violates foreign key constraint "study_user_id_fkey"');
});
