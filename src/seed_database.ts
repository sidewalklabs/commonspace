import * as pg from 'pg';
import * as uuidv4 from 'uuid/v4';

import { insertUser, User } from './datastore';

const host = '127.0.0.1';
const dbUser = 'postgres';
const dbPass = 'postgres';
const dbName = 'dataCollect';

const pool = new pg.Pool({
    max: 1,
    host: host,
    user: dbUser,
    password: dbPass,
    database: dbName
});

console.log(uuidv4());

const sebastian: User = {
    user_id: uuidv4(),
    email: 'sebastian@sidewalklabs.com',
    name: 'Eric Sebastian'
}

insertUser(pool, sebastian);
