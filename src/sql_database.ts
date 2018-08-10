import { Request, Response } from 'express';
import pg from 'pg';
import * as uuid from 'uuid';

import { createUser, User } from './datastore';

const pgConnectionInfo = {
    connectionLimit: 1,
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name
}

const pool = new pg.Pool(pgConnectionInfo);

// Return a newly generated UUID in the HTTP response.
export async function getUuid(req: Request, res: Response) {
    const { userId, email, name } = req.body;
    const insertQuery = `INSERT INTO users (user_id, email, name) VALUES ('${userId}', '${email}', '${name}')`
    console.log(insertQuery);
    const resultFromSave = createUser(pool, { userId, email, name });
    console.log('no way it works: ', resultFromSave);
    res.send(uuid.v4());
};
