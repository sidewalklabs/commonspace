import bcrypt from 'bcryptjs';
import pg, { Pool } from 'pg';
import * as uuid from 'uuid';
import { UNIQUE_VIOLATION } from 'pg-error-constants';

import { EntityAlreadyExists, IdDoesNotExist } from './utils';

export interface User {
    userId: string;
    email: string;
    password?: string;
}

export interface UserDb {
    user_id: string;
    email: string;
    password?: string | null;
    is_verified: boolean;
}

export class UnverifiedUserError extends Error {
    constructor(email) {
        super();
        this.message = `Email unverified: ${email}`;
    }
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

export async function findUserByEmail(pool: pg.Pool, email: string): Promise<UserDb> {
    const query = `SELECT user_id, email, password, is_verified FROM users where email=$1`;
    const values = [email];
    try {
        const { rowCount, rows } = await pool.query(query, values);
        if (rowCount !== 1) {
            throw new IdDoesNotExist(email);
        }
        return rows[0] as UserDb;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function findVerifiedUser(pool: pg.Pool, email: string): Promise<UserDb> {
    const user = await findUserByEmail(pool, email);
    if (!user.is_verified) {
        throw new UnverifiedUserError(email);
        return;
    }
    return user;
}

/**
 * In non developmenmt environments only successfully returns a user if the user has verified their email.
 */
export async function findUserWithPassword(
    pool: pg.Pool,
    email: string,
    password: string
): Promise<UserDb> {
    const user =
        process.env.NODE_ENV === 'development'
            ? await findUserByEmail(pool, email)
            : await findVerifiedUser(pool, email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error(`Invalid Password for user ${email}`);
    }
    return user;
}

export async function findUserById(pool: pg.Pool, userId: string): Promise<UserDb> {
    const query = 'SELECT * FROM users where user_id=$1';
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

/**
 * Fails or succeeds depending on the state of the database. If the database already has no user
 * with a lowercased version of the given email (and user_id, though that's a typical primary
 * key index, so we refrain from explaining) then we are okay to create a new user. If the email
 * is already present, we are okay to return the user_id for the previously exisiting
 * user if the user is an OAuth User (an idempotent create), but will fail if the user is already
 * has created a password protected account. We do this to prevent the case where a malicious
 * user creates an account with the email, and will later have a backdoor to the account if
 * later an user with oauth adds data, not knowing that the malicious email user already created
 * an account.
 */
export async function authenticateOAuthUser(pool: pg.Pool, email: string): Promise<string> {
    const newUserId = uuid.v4();
    const query = `INSERT INTO users (user_id, email, password, is_verified)
                   VALUES ($1, $2, $3, $4)`;
    const values = [newUserId, email, null, true];
    try {
        await pool.query(query, values);
        return newUserId;
    } catch (error) {
        const { code, constraint } = error;
        const emailConstaintViolation =
            constraint === 'users_lower_email_unique_idx' || constraint === 'users_email_key';
        if (code === UNIQUE_VIOLATION && emailConstaintViolation) {
            // if the password is empty then the user was auto created when someone assigned a survey
            // if the password is null then we use this to signify they are not a password user
            const queryForExisitinOAuthUser = `WITH lowered_email AS (
                                                   SELECT lower(email) as email, user_id, password
                                                   FROM users
                                               )
                                               SELECT user_id, password
                                               FROM lowered_email usrs
                                               WHERE usrs.email = lower($1) AND
                                                   (password is NULL OR password = '')`;
            const valuesForExisitinOAuthUser = [email];
            try {
                const { rows, rowCount } = await pool.query(
                    queryForExisitinOAuthUser,
                    valuesForExisitinOAuthUser
                );
                const exisitingOAuthUser = rowCount > 0;
                // the existing user has already created a password protected account
                if (!exisitingOAuthUser) {
                    throw new EntityAlreadyExists(email);
                    return;
                } else {
                    const { user_id: userId, password } = rows[0];
                    // the user has not yet authenticated to the application, dummy/placeholder account
                    if (password === '') {
                        // we want to set the password to null to signify that this is not a password user
                        const updatePasswordToNull = `UPDATE users
                                                      SET password = null, is_verified = TRUE
                                                      WHERE user_id = $1`;
                        const values = [userId];
                        try {
                            await pool.query(updatePasswordToNull, values);
                        } catch (error) {
                            console.error(`[query ${updatePasswordToNull}] ${error}`);
                            throw error;
                            return;
                        }
                    }
                    return userId;
                }
            } catch (error) {
                console.error(
                    `[query ${queryForExisitinOAuthUser}][values ${JSON.stringify(
                        valuesForExisitinOAuthUser
                    )}] ${error}`
                );
                throw error;
                return;
            }
        }
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

/**
 * If there is a previously exisiting user with the email, and that password is the empty
 * string we know that user was autocreated earlier, since we should never allow a user
 * to create such a weak password. In this case, we want to update the database with
 * the new password. If the password is a valid string or a null value, we decide there
 * is a already a valid user in the database for the email and throw an error indicating so.
 */
export async function createUserWithPassword(pool: pg.Pool, user: User): Promise<string> {
    const { userId, email, password } = user;
    const hash = await bcrypt.hash(user.password, 14);
    const query = `INSERT INTO users(user_id, email, password, is_verified)
                   VALUES($1, $2, $3, $4)
                   RETURNING user_id`;
    const values = [userId, email, hash, false];
    try {
        const { rows, rowCount } = await pool.query(query, values);
        const { user_id } = rows[0];
        return user_id;
    } catch (error) {
        const { code, constraint } = error;
        const emailConstaintViolation =
            constraint === 'users_lower_email_unique_idx' || constraint === 'users_email_key';
        if (code === UNIQUE_VIOLATION && emailConstaintViolation) {
            // TODO if the user is in here and the password is not yet validated, we can allow them to "reset" their password and send out another verify email after this
            // if the user has been autocreated, they should have the chance to update their account with a password of their own choosing
            const update = `UPDATE users
                            SET password = $2, is_verified = FALSE
                            WHERE user_id in (
                                SELECT user_id
                                FROM users
                                WHERE password = '' and email = $1 )
                            RETURNING user_id`;
            const autoCreatedUsersUpdateValues = [email, hash];
            try {
                const { rows: rs, rowCount: rc } = await pool.query(
                    update,
                    autoCreatedUsersUpdateValues
                );
                if (rc === 1) {
                    const { user_id } = rs[0];
                    return user_id;
                } else {
                    throw new EntityAlreadyExists(email);
                    return;
                }
            } catch (error) {
                console.error(
                    `[query ${update}][values ${JSON.stringify(
                        autoCreatedUsersUpdateValues
                    )}] ${error}`
                );
                throw error;
            }
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

export async function createUserFromEmail(pool: pg.Pool, email: string) {
    const userId = uuid.v4();
    const query = `INSERT INTO users(user_id, email, password, is_verified)
                   VALUES($1, $2, '', FALSE)`;
    const values = [userId, email];
    try {
        await pool.query(query, values);
        return userId;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}
