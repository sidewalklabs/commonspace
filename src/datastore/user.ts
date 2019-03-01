import bcrypt from 'bcryptjs';
import pg, { Pool } from 'pg';
import * as uuid from 'uuid';
import { UNIQUE_VIOLATION } from 'pg-error-constants';

import { IdAlreadyExists, IdDoesNotExist } from './utils';

export interface User {
    userId: string;
    email: string;
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
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function findUser(pool: pg.Pool, email: string) {
    const query = `SELECT * FROM users where email=$1 `;
    const values = [email];
    try {
        const pgRes = await pool.query(query, values);
        if (pgRes.rowCount !== 1) {
            throw new Error(`User not found for email: ${email}`);
        }
        const user = pgRes.rows[0];
        return user;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function findUserWithPassword(pool: pg.Pool, email: string, password: string) {
    const user = await findUser(pool, email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error(`Invalid Password for user ${email}`);
    }
    return user;
}

export async function findUserById(pool: pg.Pool, userId: string) {
    const query = `SELECT * from users where user_id=$1`;
    const values = [userId];
    try {
        const pgRes = await pool.query(query, values);
        if (pgRes.rowCount !== 1) {
            throw new Error(`User not found for user_id: ${userId}`);
        }
        const user = pgRes.rows[0];
        return user;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function changeUserPassword(pool: pg.Pool, email: string, password: string) {
    const hash = await bcrypt.hash(password, 14);
    const query = `UPDATE users
                   SET password = $1
                   WHERE email = $2`;
    const values = [hash, email];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${values}] ${error}`);
        throw error;
    }
}

export async function createUser(pool: pg.Pool, user: User): Promise<void> {
    const { userId, email, password } = user;
    const hash = await bcrypt.hash(user.password, 14);
    const query = `INSERT INTO users(user_id, email, password)
                   VALUES($1, $2, $3)`;
    const values = [userId, email, hash];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error('could not create a new user: ', error);
        if (error.code === UNIQUE_VIOLATION && error.constraint === 'users_email_key') {
            // if email exists, and the password is empty, we can overwrite with a new password
            const select_user = `SELECT user_id
                                 FROM USERS
                                 WHERE email = $1 and password = $2 and is_oauth = $3`;
            const { rows, rowCount } = await pool.query(select_user, [email, '', false]);
            if (rowCount === 1) {
                const resetPassword = `UPDATE users
                                       SET password = $1
                                       WHERE email = $2`;
                await pool.query(resetPassword, [password, email]);
                return;
            }
            throw new Error(`[error ${error}]User for email ${user.email} already exists`);
        }
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function deleteUser(pool: pg.Pool, userId: string): Promise<void> {
    const query = `DELETE
                   FROM public.users
                   WHERE users.user_id = $1`;
    const values = [userId];
    try {
        const { rowCount } = await pool.query(query, values);
        if (rowCount === 0) {
            throw new IdDoesNotExist(`Could not delete user for user_id: ${userId}`);
        }
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function userIsOAuthUser(pool: Pool, email: string) {
    const userDoesNotExistYetQuery = `SELECT user_id
                                      FROM users
                                      WHERE email = $1`;
    const { rowCount: rc } = await pool.query(userDoesNotExistYetQuery, [email]);
    if (rc === 0) {
        return true;
    }
    const query = `SELECT user_id
                   FROM users
                   WHERE email = $1 and is_oauth = $2`;
    const values = [email, true];
    try {
        const { rowCount, rows } = await pool.query(query, values);
        if (rowCount === 1) {
            const user = rows[0];
            return user.is_oauth;
        }
        return false;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function authenticateOAuthUser(pool: pg.Pool, email: string) {
    const userId = uuid.v4();
    const query = `INSERT INTO users (user_id, email, is_oauth)
                   VALUES (
                       $1,
                       $2,
                       $3
                   ) ON CONFLICT (email)
                   DO UPDATE SET email=EXCLUDED.email RETURNING user_id`;
    const values = [userId, email, true];
    try {
        const { rowCount, rows, command } = await pool.query(query, values);
        if (rowCount !== 1 && command !== 'INSERT') {
            throw new Error(`error OAuth authentication for email ${email}`);
        }
        return rows[0] as User;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function createUserFromEmail(pool: pg.Pool, email: string) {
    const userId = uuid.v4();
    const query = `INSERT INTO users(user_id, email)
                   VALUES($1, $2)`;
    const values = [userId, email];
    try {
        await pool.query(query, values);
        return userId;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}
