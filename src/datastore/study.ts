import * as pg from 'pg';
import { FeatureCollection } from 'geojson';
import { FOREIGN_KEY_VIOLATION } from 'pg-error-constants';

import { createUserFromEmail } from './user';
import { ALL_STUDY_FIELDS, javascriptArrayToPostgresArray, studyIdToTablename, StudyField } from './utils';

export type StudyScale = 'district' | 'city' | 'cityCentre' | 'neighborhood' | 'blockScale' | 'singleSite';
export type StudyType = 'stationary' | 'movement';
    
export interface Study {
    studyId: string;
    title?: string;
    author?: string;
    authorUrl?: string;
    project?: string;
    projectPhase?: string;
    startDate?: Date;
    endDate?: Date;
    scale?: StudyScale;
    areas?: any,
    userId: string;
    type: StudyType;
    map?: FeatureCollection;
    protocolVersion: string;
    fields: StudyField[];
    description?: string;
    location: string;
}

function setString(s: any) {
    return Array.from(s).toString();
}

// map over the list of fields the user wants to use to create their study and use type guarding to create a sql statement
function gehlFieldAsPgColumn(field: StudyField) {
    switch (field) {
        case  'gender':
            return 'gender data_collection.gender';
        case 'age':
            return 'age varchar(64)'; 
        case 'mode':
            return 'mode data_collection.mode';
        case 'posture':
            return 'posture data_collection.posture';
        case 'activities':
            return 'activities data_collection.activities[]';
        case 'groups':
            return 'groups data_collection.groups';
        case 'object':
            return 'object data_collection.object';
        case 'location':
            return 'location geometry';
        case 'notes':
            return 'notes text';
        default:
            throw new Error(`Unrecognized field for activity study: ${field}`);
    }
}

function createNewTableFromStudyFields(fields: StudyField[], tablename: string) {
    const additionalColumns = fields.map(gehlFieldAsPgColumn).join(',\n');
    return `CREATE TABLE ${tablename} (
                    survey_id UUID references data_collection.survey(survey_id) ON DELETE CASCADE NOT NULL,
                    data_point_id UUID PRIMARY KEY NOT NULL,
                    creation_date timestamptz,
                    last_updated timestamptz,
                    ${additionalColumns} 
                    )`;
}

export async function returnStudyMetadata(pool: pg.Pool, studyId: string): Promise<Study & {surveyors: string[]}> {
    const query = `WITH
                        study_and_surveyors (study_id, emails)
                            AS (
                                SELECT
                                    s.study_id, array_agg(u.email)
                                FROM
                                    data_collection.surveyors AS s
                                    JOIN public.users AS u
                                    ON u.user_id = s.user_id
                                GROUP BY
                                    study_id
                            )
                  SELECT
                       stu.title,
                       stu.author,
                       stu.author_url,
                       stu.protocol_version,
                       stu.study_type,
                       stu.fields,
                       stu.location,
                       stu.map,
                       stu.description,
                       sas.emails
                   FROM data_collection.study stu
                   LEFT JOIN study_and_surveyors sas
                   ON stu.study_id = sas.study_id
                   WHERE stu.study_id = $1;`
    const values = [studyId]
    try {
        const {rows, rowCount} = await pool.query(query, values);
        if (rowCount !== 1) {
            throw new Error(`Study not found for id: ${studyId}`)
        }
        const {
            author_url: authorUrl, protocol_version: protocolVersion, study_type: type, emails: surveyors
        } = rows[0];
        const study = rows[0] as Study;
        return {
            ...study,
            authorUrl,
            protocolVersion,
            type,
            studyId,
            surveyors
        }
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`)
        throw error;
    }
}

export async function userIdIsAdminOfStudy(pool: pg.Pool, studyId: string, userId: string):Promise<boolean> {
    const query = `SELECT user_id
           from data_collection.study
           where study_id = $1 and user_id = $2`
    const values = [studyId, userId]
    try {
        const { rowCount } = await pool.query(query, values);
        return rowCount === 1;
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`)
        throw error;
    }
}

export async function returnStudiesForAdmin(pool: pg.Pool, userId: string) {
    // TODO union with studies that do not have a surveyors yet
    const query = `WITH
                        study_and_surveyors (study_id, emails)
                            AS (
                                SELECT
                                    s.study_id, array_agg(u.email)
                                FROM
                                    data_collection.surveyors AS s
                                    JOIN public.users AS u
                                    ON u.user_id = s.user_id
                                GROUP BY
                                    study_id
                            )
                    SELECT
                        stu.study_id,
                        stu.title,
                        stu.author,
                        stu.author_url,
                        stu.description,
                        stu.protocol_version,
                        stu.map,
                        stu.study_type,
                        stu.fields,
                        stu.location,
                        stu.created_at,
                        stu.last_updated,
                        sas.emails
                    FROM
                        data_collection.study AS stu
                        LEFT JOIN data_collection.survey sur
                        ON stu.study_id = sur.study_id
                        LEFT JOIN study_and_surveyors AS sas
                        ON stu.study_id = sas.study_id
                    WHERE
                        stu.user_id=$1`;
    const values = [userId];
    try {
        const { rows } = await pool.query(query, values);
        const studiesForUser = rows.map(({study_id, title, author, author_url: authorUrl, description, location, protocol_version, study_type: type, fields, emails, map, created_at, last_updated }) => {
            const surveyors = emails && emails.length > 0 ? emails : [];
            return {
                study_id,
                fields,
                title,
                author,
                authorUrl,
                description,
                protocol_version,
                map,
                location,
                type,
                surveyors,
                created_at,
                last_updated
            }
        });
        return studiesForUser;
    } catch (error) {
        console.error(`error executing sql query: ${query}`)
        throw error;
    }
}
  
export async function returnStudiesUserIsAssignedTo(pool: pg.Pool, userId: string) {
   const query = `SELECT stu.study_id, stu.title as study_title, stu.author, stu.author_url, stu.description, stu.location, stu.protocol_version, stu.study_type, stu.fields, stu.map, svy.survey_id, svy.title as survey_title, svy.start_date, svy.end_date, ST_AsGeoJSON(loc.geometry)::json as survey_location, created_at, last_updated 
                 FROM data_collection.survey as svy
                 JOIN data_collection.study as stu
                 ON svy.study_id = stu.study_id
                 LEFT JOIN data_collection.location as loc
                 ON svy.location_id = loc.location_id
                 WHERE svy.user_id = $1`;
    const values = [userId]; 
    try {
        const {rows}  = await pool.query(query, values);
        const studiesAndSurveys = rows.reduce((acc, curr) => {
            const { study_id, study_title, author, author_url: authorUrl, description, location, protocol_version, fields, study_type: type, map, survey_id, start_date, survey_title, end_date, survey_location = {coordinates: [], type: 'Polygon'}, location_id, created_at, last_updated } = curr;
            const survey = {
                survey_id,
                survey_title,
                start_date,
                end_date,
                survey_location,
                location_id
            }
            if (acc[curr.study_id]) {
                acc[curr.study_id].surveys.push(survey);
            } else {
                acc[curr.study_id] = {
                    study_id,
                    author,
                    authorUrl,
                    description,
                    type,
                    map,
                    fields,
                    location,
                    protocol_version,
                    title: study_title,
                    surveys: [survey],
                    created_at,
                    last_updated
                };
            }
            return acc;
        }, {} )
        return Object.values(studiesAndSurveys);
    } catch (error) {
        console.error(`[sql ${query}] ${error}`);
        throw error;
    }
}

export async function deleteUserFromSurveyors(pool: pg.Pool, userId: string): Promise<void> {
    const query = `DELETE
                   FROM data_collection.surveyors
                   WHERE user_id = $1`;
    const values = [userId]
    try {
        await pool.query(query, values);
        return;
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`)
        throw error;
    }
}


export async function usersSurveysForStudy(pool: pg.Pool, studyId: string, userId: string) {
    const query = `SELECT s.start_date, s.end_date, s.user_id,  u.email, s.survey_id, s.title, s.representation, s.microclimate, s.temperature_c, s.method, s.user_id, s.notes
                   FROM data_collection.survey AS s
                   JOIN public.users AS u
                   ON s.user_id = u.user_id
                   WHERE s.study_id = $1 and s.user_id = $2`;
    const values = [studyId, userId];
    try {
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`)
        throw error;
    }
}


export async function allSurveysForStudy(pool: pg.Pool, studyId: string) {
    const query = `SELECT s.start_date, s.end_date, s.user_id,  u.email, s.survey_id, s.title, s.representation, s.microclimate, s.temperature_c, s.method, s.user_id, s.notes
                   FROM data_collection.survey AS s
                   JOIN public.users AS u
                   ON s.user_id = u.user_id
                   WHERE s.study_id = $1`;
    const values = [studyId];
    try {
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`)
        throw error;
    }
}

export async function deleteStudy(pool: pg.Pool, studyId: string) {
    const tablename = await studyIdToTablename(studyId);
    const deleteStudyTable = `DROP TABLE ${tablename}`;
    const deleteStudy = `DELETE from data_collection.study
                         WHERE study_id = $1`;
    const values = [studyId];
    try {
        await pool.query(deleteStudyTable);
        const {rowCount, command} = await pool.query(deleteStudy, values);
        if (rowCount !== 1 && command !== 'DELETE') {
            throw new Error(`Unable to delete study: ${studyId}`);
        }
    } catch(error) {
        console.error(`[sql ${deleteStudyTable}] [query ${deleteStudy}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function deleteStudiesForEmail(pool: pg.Pool, email: string): Promise<void> {
    const query = `DELETE
                   FROM data_collection.study stu
                   USING public.users usr
                   WHERE usr.user_id = stu.user_id and usr.email = $1
                   returning tablename`
    const values = [email];
    const { rowCount: rc1, rows } = await pool.query(query, values);
    await Promise.all(rows.map(({tablename}) => {
        return pool.query(`drop table ${tablename}`);
    }))
}

export async function deleteStudiesForUserId(pool: pg.Pool, userId: string): Promise<void> {
    const query = `DELETE
                   FROM data_collection.study stu
                   WHERE stu.user_id= $1
                   returning tablename`
    const values = [userId];
    let rows, rowCount;
    try {
        const res = await pool.query(query, values);
        rows = res.rows; 
        rowCount = res.rowCount;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`)
        throw error;
    }
    await Promise.all(rows.map(({tablename}) => {
        try {
            const query = `drop table ${tablename}`;
            return pool.query(`drop table ${tablename}`);
        } catch (error) {
                console.error(`[query ${query}] ${error}`)
            throw error;
        }
    }))
    return rowCount;
}

export async function createStudy(pool: pg.Pool, study: Study): Promise<{created_at: number, last_updated: number}> {
    const studyTablename = studyIdToTablename(study.studyId);
    // as a time saver create the table with all possible fields, expect client to play by the
    // rules, and only update the fields it should, this makes it easy (no-migration requried) 
    // to allow someone to update the fields of a study whenever they'd like
    const newStudyDataTableQuery = createNewTableFromStudyFields(ALL_STUDY_FIELDS, studyTablename);
    const fields = javascriptArrayToPostgresArray(study.fields);
    const { studyId, title, author, authorUrl, userId, protocolVersion, type, location, map={}, description='' } = study;
    const newStudyMetadataQuery = `INSERT INTO data_collection.study(study_id, title, author, author_url, user_id, protocol_version, study_type, fields, tablename, map, location, description)
                                   VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                                   RETURNING created_at, last_updated`;
    const newStudyMetadataValues = [studyId, title, author, authorUrl, userId, protocolVersion, type, fields, studyTablename, JSON.stringify(map), location, description];
    let studyResult, newStudyDataTable;
    try {
        studyResult = await pool.query(newStudyMetadataQuery, newStudyMetadataValues);
    } catch (error) {
        console.error(`[query ${newStudyMetadataQuery}][values ${JSON.stringify(newStudyMetadataValues)}] ${error}`);
        throw error;
    }
    try {
        newStudyDataTable = await pool.query(newStudyDataTableQuery);
    } catch (error) {
        console.error(`[query ${newStudyDataTableQuery}] ${error}`);
        throw error;
    }

    const { rows } = studyResult;
    const { created_at, last_updated } = rows[0];
    return { created_at, last_updated };
}

export async function updateStudy(pool: pg.Pool, study: Study) {
    const { studyId, userId, title, author, authorUrl, description, protocolVersion, type, fields, location, map } = study;
    const studyTablename = studyIdToTablename(studyId)
    const newStudyMetadataQuery = `INSERT INTO data_collection.study(study_id, title, user_id, author, author_url, description, protocol_version, study_type, fields, tablename, map, location, last_updated)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, to_timestamp($13))`;
    const query = `${newStudyMetadataQuery}
                   ON CONFLICT (study_id)
                   DO UPDATE SET (title, author, author_url, description, protocol_version, fields, map, location, last_updated)
                       = ($14, $15, $16, $17, $18, $19, $20, $21, to_timestamp($22))`
    const values = [studyId, title, userId, author, authorUrl, description, protocolVersion, type, fields, studyTablename, JSON.stringify(map), location, Date.now()/1000, title, author, authorUrl, description, protocolVersion, fields, JSON.stringify(map), location, Date.now()/1000];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[sql ${query}] [values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function giveUserStudyAccess(pool: pg.Pool, userEmail: string, studyId: string) {
    const query = `INSERT INTO data_collection.surveyors
                   (SELECT coalesce
                      ((SELECT pu.user_id FROM public.users pu WHERE pu.email = $1),
                      '00000000-0000-0000-0000-000000000000'),
                   $2)`
    const values = [userEmail, studyId];
    try {
        const pgRes = await pool.query(query, values);
        return [pgRes, null];
    } catch (error) {
        if (error.code === FOREIGN_KEY_VIOLATION) {
            const newUserId = await createUserFromEmail(pool, userEmail);
            const pgRes2 = await pool.query(query, values);
            return [pgRes2, newUserId];
        }
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function checkUserIdIsSurveyor(pool: pg.Pool, userId: string, surveyId: string) {
    const query = `SELECT user_id, survey_id
                   FROM data_collection.survey
                   WHERE user_id = $1 and survey_id = $2`
    const values = [userId, surveyId];
    try {
        const { command, rowCount } = await pool.query(query, values);
        if (command !== 'SELECT' && rowCount !== 1) {
            return false
        }
        return true
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}
