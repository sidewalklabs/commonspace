import bcrypt from 'bcryptjs';
import * as pg from 'pg';
import * as uuid from 'uuid';

export interface User {
    userId: string;
    email: string;
    name: string;
    password: string;
}

export async function userIsAdminOfStudy(pool: pg.Pool, studyId: string, userId: string) {
    const query = `SELECT * from data_collection.study
                   WHERE user_id=$1 and study_id=$2`;
    const values = [userId, studyId];
    try {
        const { rowCount } = await pool.query(query, values);
        if (rowCount === 1) {
            return true;
        }
        return false;
    } catch (error) {
        console.error(`[sql ${query}] ${error}`);
    }
}

export async function findUser(pool: pg.Pool, email: string, password: string) {
    const query = `SELECT * FROM users where email='${email}'`;
    const pgRes = await pool.query(query);
    if (pgRes.rowCount !== 1) {
        throw new Error(`User not found for email: ${email}`)
    }
    const user = pgRes.rows[0];
    return user;
}

export async function findUserById(pool: pg.Pool, userId: string) {
    const query = `SELECT * from users where user_id='${userId}'`
    const pgRes = await pool.query(query);
    if (pgRes.rowCount !== 1) {
        throw new Error(`User not found for user_id: ${userId}`)
    }
    const user = pgRes.rows[0];
    return user;
}

export async function createUser(pool: pg.Pool, user: User) {
    const hash = await bcrypt.hash(user.password, 14)
    const query = `INSERT INTO users(user_id, email, name, password)
                   VALUES('${user.userId}', '${user.email}', '${user.name}', '${hash}')`;
    return pool.query(query);
}

export async function authenticateOAuthUser(pool: pg.Pool, email: string) {
    const userId = uuid.v4();
    const query = `INSERT INTO users (user_id, email)
                   VALUES (
                       '${userId}',
                       '${email}'
                   ) ON CONFLICT (email)
                   DO UPDATE SET email=EXCLUDED.email RETURNING user_id`;
    try {
        const {rowCount, rows, command} = await pool.query(query);
        if (rowCount !== 1 && command !== 'INSERT') {
            throw new Error(`error OAuth authentication for email ${email}`);
        }
        return rows[0] as User;
    } catch (error) {
        console.error(error);
        console.error(`could not handle OAuth user for email: ${email}`);
        throw error;
    }
}

export async function createUserFromEmail(pool: pg.Pool, email: string) {
    const userId = uuid.v4();
    const query = `INSERT INTO users(user_id, email)
                   VALUES('${userId}', '${email}')`;
    try {
        await pool.query(query);
        return userId;
    } catch (error) {
        console.error(error);
        console.error(`could not add user with email: ${email}, with query: ${query}`);
        throw error;
    }
}
