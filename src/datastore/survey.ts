import { Pool } from 'pg';
import { IdAlreadyExists } from './utils';
import { UNIQUE_VIOLATION } from 'pg-error-constants';

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
    userEmail?: string;
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
        userEmail,
        locationId
    } = survey;
    let query, values;
    if (locationId) {
        query = `WITH t (study_id, survey_id, title, start_date, end_date, representation, method, user_email, location_id) AS (
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
            ON t.user_email = u.email`;
        values = [
            studyId,
            surveyId,
            title,
            startDate,
            endDate,
            representation,
            method,
            userEmail,
            locationId
        ];
    } else {
        query = `WITH t (study_id, survey_id, title, start_date, end_date, representation, method, user_email) AS (
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
            ON t.user_email = u.email`;
        values = [studyId, surveyId, title, startDate, endDate, representation, method, userEmail];
    }
    return { query, values };
}

export async function createNewSurveyForStudy(pool: Pool, survey: Survey) {
    let { query, values } = joinSurveyWithUserEmailCTE(survey);
    if (survey.locationId) {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, start_date, end_date, representation, method, user_id, location_id)
                   ${query};`;
    } else {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, start_date, end_date, representation, method, user_id)
                   ${query};`;
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

export function updateSurvey(pool: Pool, survey: Survey) {
    const { title, locationId, startDate, endDate, userEmail, surveyId } = survey;
    const query = `UPDATE data_collection.survey as sur
                   SET title = $1,
                      location_id = $2,
                      start_date = $3,
                      end_date = $4
                   WHERE sur.survey_id = $5`;
    const values = [title, locationId, startDate, endDate, surveyId];
    try {
        return pool.query(query, values);
    } catch (error) {
        console.error(`[query: ${query}][values: ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function checkUserIdIsSurveyor(pool: Pool, userId: string, surveyId: string) {
    const query = `SELECT survey_id
                   FROM data_collection.survey
                   WHERE user_id = $1 and survey_id = $2`;
    const values = [userId, surveyId];
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
