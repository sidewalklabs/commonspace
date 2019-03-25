import pg, { QueryResult } from 'pg';
import { FeatureCollection } from 'geojson';
import { FOREIGN_KEY_VIOLATION, UNIQUE_VIOLATION } from 'pg-error-constants';

import { createUserFromEmail } from './user';
import {
    ALL_STUDY_FIELDS,
    javascriptArrayToPostgresArray,
    IdAlreadyExists,
    IdDoesNotExist,
    studyIdToTablename,
    StudyField
} from './utils';
import { string } from 'prop-types';

export type StudyScale =
    | 'district'
    | 'city'
    | 'cityCentre'
    | 'neighborhood'
    | 'blockScale'
    | 'singleSite';

export type StudyType = 'stationary' | 'movement';
export type StudyStatus = 'active' | 'completed';

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
    areas?: any;
    userId: string;
    type: StudyType;
    map?: FeatureCollection;
    status: StudyStatus;
    protocolVersion: string;
    fields: StudyField[];
    description?: string;
    location: string;
}

function setString(s: any) {
    return Array.from(s).toString();
}

// map over the list of fields the user wants to use to create their study and use type guarding to create a sql statement
function fieldNameToColumnName(field: StudyField) {
    switch (field) {
        case 'gender':
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
    const additionalColumns = fields.map(fieldNameToColumnName).join(',\n');
    return `CREATE TABLE ${tablename} (
                    survey_id UUID references data_collection.survey(survey_id) ON DELETE CASCADE NOT NULL,
                    data_point_id UUID PRIMARY KEY NOT NULL,
                    creation_date timestamptz,
                    last_updated timestamptz,
                    ${additionalColumns} 
            )`;
}

export async function returnStudyMetadata(
    pool: pg.Pool,
    studyId: string
): Promise<Study & { surveyors: string[] }> {
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
                       stu.status,
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
                   WHERE stu.study_id = $1;`;
    const values = [studyId];
    try {
        const { rows, rowCount } = await pool.query(query, values);
        if (rowCount !== 1) {
            throw new IdDoesNotExist(studyId);
        }
        const {
            author_url: authorUrl,
            protocol_version: protocolVersion,
            study_type: type,
            emails: surveyors
        } = rows[0];
        const study = rows[0] as Study;
        return {
            ...study,
            authorUrl,
            protocolVersion,
            type,
            studyId,
            surveyors
        };
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function userIdIsAdminOfStudy(
    pool: pg.Pool,
    studyId: string,
    userId: string
): Promise<boolean> {
    const query = `SELECT user_id
           from data_collection.study
           where study_id = $1 and user_id = $2`;
    const values = [studyId, userId];
    try {
        const { rowCount } = await pool.query(query, values);
        return rowCount === 1;
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`);
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
                        stu.status,
                        stu.study_type,
                        stu.fields,
                        stu.location,
                        stu.created_at,
                        stu.last_updated,
                        sas.emails
                    FROM
                        data_collection.study AS stu
                        LEFT JOIN study_and_surveyors AS sas
                        ON stu.study_id = sas.study_id
                    WHERE
                        stu.user_id=$1`;
    const values = [userId];
    try {
        const { rows } = await pool.query(query, values);
        const studiesForUser = rows.map(
            ({
                study_id,
                title,
                author,
                author_url: authorUrl,
                description,
                location,
                protocol_version,
                study_type: type,
                status,
                fields,
                emails,
                map,
                created_at,
                last_updated
            }) => {
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
                    status,
                    surveyors,
                    created_at,
                    last_updated
                };
            }
        );
        const withSurveys = await Promise.all(
            studiesForUser.map(async s => {
                const surveys = await allSurveysForStudy(pool, s.study_id);
                return {
                    ...s,
                    surveys
                };
            })
        );
        return withSurveys;
    } catch (error) {
        console.error(`error executing sql query: ${query}`);
        throw error;
    }
}

export async function returnStudiesUserIsAssignedTo(pool: pg.Pool, userId: string) {
    const query = `SELECT stu.study_id, stu.title as study_title, stu.author, stu.author_url, stu.description, stu.location, stu.protocol_version, stu.study_type, stu.status, stu.fields, stu.map, svy.survey_id, svy.title as survey_title, svy.start_date, svy.end_date, ST_AsGeoJSON(loc.geometry)::json as survey_location, created_at, last_updated
                 FROM data_collection.survey as svy
                 JOIN data_collection.study as stu
                 ON svy.study_id = stu.study_id
                 LEFT JOIN data_collection.location as loc
                 ON svy.location_id = loc.location_id
                 WHERE svy.user_id = $1`;
    const values = [userId];
    try {
        const { rows } = await pool.query(query, values);
        const studiesAndSurveys = rows.reduce((acc, curr) => {
            const {
                study_id,
                study_title,
                author,
                author_url: authorUrl,
                description,
                location,
                protocol_version,
                fields,
                study_type: type,
                status,
                map,
                survey_id,
                start_date,
                survey_title,
                end_date,
                survey_location = { coordinates: [], type: 'Polygon' },
                location_id,
                created_at,
                last_updated
            } = curr;
            const survey = {
                survey_id,
                survey_title,
                start_date,
                end_date,
                survey_location,
                location_id
            };
            if (acc[curr.study_id]) {
                acc[curr.study_id].surveys.push(survey);
            } else {
                acc[curr.study_id] = {
                    study_id,
                    author,
                    authorUrl,
                    description,
                    type,
                    status,
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
        }, {});
        return Object.values(studiesAndSurveys);
    } catch (error) {
        console.error(`[sql ${query}] ${error}`);
        throw error;
    }
}

export async function removeUserFromAllSurveys(pool: pg.Pool, userId: string): Promise<void> {
    const values = [userId];
    const addSentinelQuery = `INSERT INTO data_collection.surveyors (study_id, user_id)
                              SELECT study_id, '00000000-0000-0000-0000-000000000001'
                              FROM data_collection.surveyors
                              WHERE user_id = $1
                                  AND study_id NOT IN (
                                      SELECT study_id
                                      FROM data_collection.surveyors
                                      WHERE user_id = '00000000-0000-0000-0000-000000000001'
                                  )`;
    const assignSurveysToSentinelQuery = `UPDATE data_collection.survey
                                          SET user_id = '00000000-0000-0000-0000-000000000001'
                                          WHERE user_id = $1`;
    const removeUserFromSurveyors = `DELETE FROM data_collection.surveyors
                                     WHERE user_id = $1`;
    const queries = [addSentinelQuery, assignSurveysToSentinelQuery, removeUserFromSurveyors];

    try {
        await queries
            .map(q => pool.query(q, values))
            .reduce(async (chain, f) => {
                const xs = await chain;
                const x = await f;
                return [...xs, x];
            }, Promise.resolve([] as QueryResult[]));
    } catch (error) {
        console.error(`[sql ${queries}][values ${JSON.stringify(values)}] ${error}`);
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
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function allSurveysForStudy(pool: pg.Pool, studyId: string) {
    const query = `SELECT s.start_date, s.end_date, s.user_id,  u.email, s.survey_id, s.title, s.location_id, s.representation, s.microclimate, s.temperature_c, s.method, s.user_id, s.notes
                   FROM data_collection.survey AS s
                   JOIN public.users AS u
                   ON s.user_id = u.user_id
                   WHERE s.study_id = $1`;
    const values = [studyId];
    try {
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`);
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
        const { rowCount, command } = await pool.query(deleteStudy, values);
        if (rowCount !== 1 && command !== 'DELETE') {
            throw new Error(`Unable to delete study: ${studyId}`);
        }
    } catch (error) {
        console.error(
            `[sql ${deleteStudyTable}] [query ${deleteStudy}][values ${JSON.stringify(
                values
            )}] ${error}`
        );
        throw error;
    }
}

export async function deleteStudiesForEmail(pool: pg.Pool, email: string): Promise<void> {
    const query = `DELETE
                   FROM data_collection.study stu
                   USING public.users usr
                   WHERE usr.user_id = stu.user_id and usr.email = $1
                   returning tablename`;
    const values = [email];
    const { rowCount: rc1, rows } = await pool.query(query, values);
    await Promise.all(
        rows.map(({ tablename }) => {
            return pool.query(`drop table ${tablename}`);
        })
    );
}

export async function deleteStudiesForUserId(pool: pg.Pool, userId: string): Promise<void> {
    const query = `DELETE
                   FROM data_collection.study stu
                   WHERE stu.user_id= $1
                   returning tablename`;
    const values = [userId];
    let rows, rowCount;
    try {
        const res = await pool.query(query, values);
        rows = res.rows;
        rowCount = res.rowCount;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
    await Promise.all(
        rows.map(({ tablename }) => {
            try {
                const query = `drop table ${tablename}`;
                return pool.query(`drop table ${tablename}`);
            } catch (error) {
                console.error(`[query ${query}] ${error}`);
                throw error;
            }
        })
    );
    return rowCount;
}

export async function createStudy(
    pool: pg.Pool,
    study: Study
): Promise<{ createdAt: number; lastUpdated: number }> {
    const studyTablename = studyIdToTablename(study.studyId);
    // as a time saver create the table with all possible fields, expect client to play by the
    // rules, and only update the fields it should, this makes it easy (no-migration requried)
    // to allow someone to update the fields of a study whenever they'd like
    const newStudyDataTableQuery = createNewTableFromStudyFields(ALL_STUDY_FIELDS, studyTablename);
    const fields = javascriptArrayToPostgresArray(study.fields);
    const {
        studyId,
        title,
        author,
        authorUrl,
        userId,
        protocolVersion,
        type,
        status,
        location,
        map = {},
        description = ''
    } = study;
    const newStudyMetadataQuery = `INSERT INTO data_collection.study(study_id, title, author, author_url, user_id, protocol_version, study_type, status, fields, tablename, map, location, description)
                                   VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                                   RETURNING created_at, last_updated`;
    const newStudyMetadataValues = [
        studyId,
        title,
        author,
        authorUrl,
        userId,
        protocolVersion,
        type,
        status,
        fields,
        studyTablename,
        JSON.stringify(map),
        location,
        description
    ];
    let studyResult, newStudyDataTable;
    try {
        studyResult = await pool.query(newStudyMetadataQuery, newStudyMetadataValues);
    } catch (error) {
        console.error(
            `[query ${newStudyMetadataQuery}][values ${JSON.stringify(
                newStudyMetadataValues
            )}] ${error}`
        );
        if (error.code === UNIQUE_VIOLATION) {
            throw new IdAlreadyExists(studyId);
        }
        throw error;
    }
    try {
        newStudyDataTable = await pool.query(newStudyDataTableQuery);
    } catch (error) {
        console.error(`[query ${newStudyDataTableQuery}] ${error}`);
        throw error;
    }

    const { rows } = studyResult;
    const { created_at: createdAt, last_updated: lastUpdated } = rows[0];
    return { createdAt, lastUpdated };
}

export async function updateStudy(pool: pg.Pool, study: Study) {
    const {
        studyId,
        userId,
        title,
        author,
        authorUrl,
        description,
        protocolVersion,
        type,
        status,
        fields,
        location,
        map
    } = study;
    const studyTablename = studyIdToTablename(studyId);
    const lastUpdated = Date.now() / 1000;
    const newStudyMetadataQuery = `INSERT INTO data_collection.study(study_id, title, user_id, author, author_url, description, protocol_version, study_type, status, fields, tablename, map, location, last_updated)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, to_timestamp($14))`;
    const query = `${newStudyMetadataQuery}
                   ON CONFLICT (study_id)
                   DO UPDATE SET (title, author, author_url, description, protocol_version, status, fields, map, location, last_updated)
                       = ($15, $16, $17, $18, $19, $20, $21, $22, $23, to_timestamp($24))
                       RETURNING last_updated`;
    const values = [
        studyId,
        title,
        userId,
        author,
        authorUrl,
        description,
        protocolVersion,
        type,
        status,
        fields,
        studyTablename,
        JSON.stringify(map),
        location,
        lastUpdated,
        title,
        author,
        authorUrl,
        description,
        protocolVersion,
        status,
        fields,
        JSON.stringify(map),
        location,
        lastUpdated
    ];
    try {
        const { rows } = await pool.query(query, values);
        const { last_updated: lastUpdated } = rows[0];
        return { ...study, lastUpdated };
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
                   $2)`;
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

export async function getSurveyorsForStudy(pool: pg.Pool, studyId: string): Promise<string[]> {
    const query = `SELECT email
                   FROM users
                   JOIN data_collection.surveyors as svyrs
                   ON users.user_id = svyrs.user_id
                   WHERE study_id = $1`;
    const values = [studyId];
    try {
        const { rows } = await pool.query(query, values);
        return rows.map(({ email }) => email);
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

async function removeUserFromAllTheirSurveys(pool: pg.Pool, userId: string): Promise<void> {
    const query = `UPDATE data_collection.survey
                   SET user_id = '00000000-0000-0000-0000-000000000001'
                   WHERE user_id = $1`;
    const values = [userId];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

async function setSurveysForUserToSentinelUser(
    pool: pg.Pool,
    studyId: string,
    email: string
): Promise<void> {
    const query = `UPDATE data_collection.survey
                   SET user_id = '00000000-0000-0000-0000-000000000001'
                   WHERE survey_id IN (
                       SELECT survey_id
                       FROM data_collection.survey sur
                       JOIN users us
                       ON us.user_id = sur.user_id
                       WHERE sur.study_id = $1 and us.email = $2
                   )`;
    const values = [studyId, email];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function deleteSurveyorFromStudy(
    pool: pg.Pool,
    studyId: string,
    surveyorEmail: string
): Promise<void> {
    await setSurveysForUserToSentinelUser(pool, studyId, surveyorEmail);
    const query = `UPDATE data_collection.surveyors
                   SET user_id = '00000000-0000-0000-0000-000000000001'
                   WHERE study_id = $1
                       AND user_id in (SELECT user_id
                            FROM users
                            WHERE users.email = $2)`;
    const values = [studyId, surveyorEmail];
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}
