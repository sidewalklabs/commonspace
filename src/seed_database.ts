import * as dotenv from 'dotenv';
import * as pg from 'pg';
import * as uuidv4 from 'uuid/v4';

import { createUser, User, Study, createStudy } from './datastore';

dotenv.config();

// @ts-ignore: global variable
const host = process.env.db_host;
// @ts-ignore: global variable
const dbUser = process.env.db_user;
// @ts-ignore: global variable
const dbPass = process.env.db_pass;
// @ts-ignore: global variables
const dbName = process.env.db_name;

const pool = new pg.Pool({
    max: 1,
    host: host,
    user: dbUser,
    password: dbPass,
    database: dbName
});

const sebastian: User = {
    userId: uuidv4(),
    email: 'sebastian@sidewalklabs.com',
    name: 'Eric Sebastian'
}

const thorncliffeParkStudy: Study = {
    title: 'Thornecliffe Park and Sabina Ali Study',
    studyId: uuidv4(),
    protocolVersion: '1.0',
    userId: sebastian.userId,
}

const studyFields = ['gender', 'location'];

async function testSqlFunctions() {
    const user = await createUser(pool, sebastian);
    console.log(`User: ${user}`);
    const study = await createStudy(pool, sebastian, thorncliffeParkStudy, ['gender', 'location']);
    console.log(`study: ${study}`);
}

testSqlFunctions();
