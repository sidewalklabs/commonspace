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
        values =  [studyId, surveyId, title, startDate, endDate, representation, method, userEmail, locationId];
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
        values =  [studyId, surveyId, title, startDate, endDate, representation, method, userEmail];
    }
    return { query, values };
}

export async function createNewSurveyForStudy(pool: pg.Pool, survey) {
    let { query, values } = joinSurveyWithUserEmailCTE(survey);
    if (survey.locationId ) {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, start_date, end_date, representation, method, user_id, location_id)
                   ${query};`
    } else {
        query = `INSERT INTO data_collection.survey (study_id, survey_id, title, start_date, end_date, representation, method, user_id)
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
    const { title, locationId, startDate, endDate, userEmail } = survey;
   const query = `WITH t (title, location_id, start_date, end_date, user_email) as (
                      VALUES (
                             $1::text,
                             $2::UUID,
                             $3::timestamp with time zone,
                             $4::timestamp with time zone,
                             $5::TEXT
                      )
                  )
                  UPDATE data_collection.survey
                  SET title = t.title,
                      location_id = t.location_id,
                      start_date = t.start_date,
                      end_date = t.end_date,
                      user_email = t.user_email`
    const values = [title, locationId, startDate, endDate, userEmail] ;
    try {
        return pool.query(query, values);
    } catch (error) {
        console.error(`[query: ${query}][values: ${JSON.stringify(values)}] ${error}`)
        throw error;
    }
}
