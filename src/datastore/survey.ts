import * as pg from 'pg';

export interface Survey {
    studyId: string;
    locationId: string;
    surveyId: string;
    title?: string;
    startDate?: string,
    endDate?: string,
    timeCharacter?: string;
    representation: string;
    microclimate?: string;
    temperatureCelcius?: number;
    method: string;
    userEmail?: string;
    notes?: string;
}

function joinSurveyWithUserEmailCTE(survey: Survey) {
    const { studyId, surveyId, title, startDate, endDate, representation, method, userEmail, locationId } = survey;
    let query, values;
    if (locationId) {
        query = `WITH t (study_id, survey_id, title, time_start, time_stop, representation, method, user_email, location_id) AS (
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
            SELECT t.study_id, t.survey_id, t.title, t.time_start, t.time_stop, t.representation, t.method, u.user_id, t.location_id
            FROM  t
            JOIN public.users u
            ON t.user_email = u.email`;
        values =  [studyId, surveyId, title, startDate, endDate, representation, method, userEmail, locationId];
    } else {
        query = `WITH t (study_id, survey_id, title, time_start, time_stop, representation, method, user_email) AS (
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
            SELECT t.study_id, t.survey_id, t.title, t.time_start, t.time_stop, t.representation, t.method, u.user_id
            FROM  t
            JOIN public.users u
            ON t.user_email = u.email`;
        values =  [studyId, surveyId, title, startDate, endDate, representation, method, userEmail];
    }
    return { query, values };
}

export async function createNewSurveyForStudy(pool: pg.Pool, survey) {
    let { query, values } = joinSurveyWithUserEmailCTE(survey);
    if (survey.locationId ) {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, time_start, time_stop, representation, method, user_id, location_id)
                   ${query};`
    } else {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, time_start, time_stop, representation, method, user_id)
                   ${query};`
    }
    try {
        return pool.query(query, values);
    } catch (error) {
        console.error(`[sql ${query}] [values ${JSON.stringify(values)}] ${error}`)
        console.error(`postgres error: ${error} for query: ${query}`);
        throw error;
    }
}

export function updateSurvey(pool: pg.Pool, survey: Survey) {
   const query = `WITH t (title, location_id, time_start, time_stop, user_email) as (
                      VALUES (
                             '${survey.title}'::text,
                             '${survey.locationId}'::UUID,
                             '${survey.startDate}'::timestamp with time zone,
                             '${survey.endDate}'::timestamp with time zone,
                             '${survey.userEmail}'::TEXT
                      )
                  )
                  UPDATE date_collection.survey
                  SET title = t.title,
                      location_id = t.location_id,
                      time_start = t.time_start,
                      time_stop = t.time_stop,
                      user_email = t.user_email`

    try {
        return pool.query(query);
    } catch (error) {
        console.error(`[query: ${query}] ${error}`)
        throw error;
    }
}
