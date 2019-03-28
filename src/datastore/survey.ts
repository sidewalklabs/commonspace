import { Pool } from 'pg';
import { IdAlreadyExists } from './utils';
import { UNIQUE_VIOLATION } from 'pg-error-constants';
import { findUser } from './user';
import { IdDoesNotExist } from './utils';

export interface Survey {
    studyId: string;
    locationId: string;
    surveyId: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    timeCharacter?: string;
    representation: string;
    microclimate?: string;
    temperatureCelcius?: number;
    method: string;
    email?: string;
    notes?: string;
}

function joinSurveyWithUserEmailCTE(survey: Survey) {
    const {
        studyId,
        surveyId,
        title,
        startDate,
        endDate,
        representation,
        method,
        email,
        locationId
    } = survey;
    let query, values;
    if (locationId) {
        query = `WITH t (study_id, survey_id, title, start_date, end_date, representation, method, email, location_id) AS (
              VALUES(
                     $1::UUID,
                     $2::UUID,
                     $3::TEXT,
                     $4::TIMESTAMP WITH TIME ZONE,
                     $5::TIMESTAMP WITH TIME ZONE,
                     $6::TEXT,
                     $7::TEXT,
                     $8::TEXT,
                     $9::UUID
              )
            )
            SELECT t.study_id, t.survey_id, t.title, t.start_date, t.end_date, t.representation, t.method, u.user_id, t.location_id
            FROM  t
            JOIN public.users u
            ON t.email = u.email`;
        values = [
            studyId,
            surveyId,
            title,
            startDate,
            endDate,
            representation,
            method,
            email,
            locationId
        ];
    } else {
        query = `WITH t (study_id, survey_id, title, start_date, end_date, representation, method, email) AS (
              VALUES(
                     $1::UUID,
                     $2::UUID,
                     $3::TEXT,
                     $4::TIMESTAMP WITH TIME ZONE,
                     $5::TIMESTAMP WITH TIME ZONE,
                     $6::TEXT,
                     $7::TEXT,
                     $8::TEXT
              )
            )
            SELECT t.study_id, t.survey_id, t.title, t.start_date, t.end_date, t.representation, t.method, u.user_id
            FROM  t
            JOIN public.users u
            ON t.email = u.email`;
        values = [studyId, surveyId, title, startDate, endDate, representation, method, email];
    }
    return { query, values };
}

export async function createNewSurveyForStudy(pool: Pool, survey: Survey) {
    let { query, values } = joinSurveyWithUserEmailCTE(survey);
    if (survey.locationId) {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, start_date, end_date, representation, method, user_id, location_id)
                   ${query}`;
    } else {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, start_date, end_date, representation, method, user_id)
                   ${query}`;
    }
    try {
        return pool.query(query, values);
    } catch (error) {
        console.error(`[sql ${query}] [values ${JSON.stringify(values)}] ${error}`);
        if (error.code === UNIQUE_VIOLATION) {
            throw new IdAlreadyExists(survey.surveyId);
        }
        throw error;
    }
}

export async function updateSurvey(pool: Pool, survey: Survey) {
    const { title, locationId, startDate, endDate, email, surveyId } = survey;
    let { query, values } = joinSurveyWithUserEmailCTE(survey);
    query = `INSERT INTO data_collection.survey (study_id, survey_id, title, start_date, end_date, representation, method, user_id, location_id)
             ${query}
                   ON CONFLICT (survey_id)
                   DO UPDATE
                   SET title = $${values.length + 1},
                       location_id = $${values.length + 2},
                       start_date = $${values.length + 3},
                       end_date = $${values.length + 4}`;
    values = values.concat([title, locationId, startDate, endDate]);
    try {
        await pool.query(query, values);
        return;
    } catch (error) {
        console.error(`[query: ${query}][values: ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
    const { user_id: userId } = await findUser(pool, email);
    const updateUserQuery = `UPDATE data_collection
                             SET user_id = $1
                             WHERE survey_id = $1`;
    const updateUserValues = [userId, surveyId];
    try {
        await pool.query(updateUserQuery, updateUserValues);
    } catch (error) {
        console.error(
            `[query: ${updateUserQuery}][values: ${JSON.stringify(updateUserValues)}] ${error}`
        );
    }
}

// userId is optional, incase you want to force some authorization here
export async function getFieldsAndTablenameForSurvey(
    pool: Pool,
    surveyId: string,
    userId?: string
) {
    let query = `SELECT tablename, fields
                 FROM data_collection.study stu
                 JOIN data_collection.survey sur
                 ON stu.study_id = sur.study_id
                 WHERE sur.survey_id = $1`;
    query = userId ? query + ' and $2' : query;
    const values = userId ? [surveyId, userId] : [surveyId];
    try {
        const { rowCount, rows } = await pool.query(query, values);
        if (rowCount !== 1) {
            throw new IdDoesNotExist(surveyId);
        }
        const { fields, tablename } = rows[0];
        return { fields, tablename };
    } catch (error) {
        console.error(`[query: ${query}][values: ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function userIdIsSurveyor(pool: Pool, userId: string, surveyId: string) {
    const query = `SELECT survey_id
                   FROM data_collection.survey sur
                   WHERE sur.user_id = $1 and sur.survey_id = $2 and sur.study_id IN (
                       SELECT study_id
                       FROM data_collection.surveyors srvys
                       WHERE srvys.user_id = $3)`;
    const values = [userId, surveyId, userId];

    try {
        const { rowCount } = await pool.query(query, values);
        if (rowCount !== 1) {
            return false;
        }
        return true;
    } catch (error) {
        console.error(`[query: ${query}][values: ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}
