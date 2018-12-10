import * as pg from 'pg';
import { FeatureCollection } from 'geojson';
import { FOREIGN_KEY_VIOLATION } from 'pg-error-constants';

import { createUserFromEmail } from './user';
import { studyIdToTablename, ActivityCountField } from './utils'; 

export type StudyScale = 'district' | 'city' | 'cityCentre' | 'neighborhood' | 'blockScale' | 'singleSite';
export type StudyType = 'activity' | 'movement';
    
export interface Study {
    studyId: string;
    title?: string;
    project?: string;
    projectPhase?: string;
    startDate?: Date;
    endDate?: Date;
    scale?: StudyScale;
    areas?: any,
    userId: string;
    type: 'activity' | 'movement';
    map?: FeatureCollection;
    protocolVersion: string;
    notes?: string;
}

function setString(s: any) {
    return Array.from(s).toString();
}

// map over the list of fields the user wants to use to create their study and use type guarding to create a sql statement
function gehlFieldAsPgColumn(field: ActivityCountField) {
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
            return 'location geometry NOT NULL';
        case 'note':
            return 'note text';
        case 'creation_date':
            return 'creation_date timestamptz';
        case 'last_updated':
            return 'last_updated timestamptz';
        default:
            throw new Error(`Unrecognized field for activity study: ${field}`);
    }
}

function createNewTableFromActivityCountFields(study: Study, tablename: string, fields: ActivityCountField[]) {
    const additionalColumns = fields.map(gehlFieldAsPgColumn).join(',\n');
    return `CREATE TABLE ${tablename} (
                    survey_id UUID references data_collection.survey(survey_id) ON DELETE CASCADE NOT NULL,
                    data_point_id UUID PRIMARY KEY NOT NULL,
                    ${additionalColumns} 
                    )`;
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
                        stu.protocol_version,
                        stu.map,
                        stu.study_type,
                        sas.emails
                    FROM
                        data_collection.study AS stu
                        LEFT JOIN study_and_surveyors AS sas
                        ON stu.study_id = sas.study_id
                    WHERE
                        stu.user_id='${userId}'`;
    try {
        const { rows } = await pool.query(query);
        const studiesForUser = rows.map(({study_id, title, protocol_version, study_type: type, emails, map}) => {
            const surveyors = emails && emails.length > 0 ? emails : [];
            return {
                study_id,
                title,
                protocol_version,
                map,
                type,
                surveyors
            }
        });
        return studiesForUser;
    } catch (error) {
        console.error(`error executing sql query: ${query}`)
        throw error;
    }
}
  
export async function returnStudiesUserIsAssignedTo(pool: pg.Pool, userId: string) {
   const query = `SELECT stu.study_id, stu.title as study_title, stu.protocol_version, stu.study_type, stu.map, svy.survey_id, svy.title as survey_title, svy.time_start, svy.time_stop, ST_AsGeoJSON(loc.geometry)::json as survey_location
                 FROM data_collection.survey as svy
                 JOIN data_collection.study as stu
                 ON svy.study_id = stu.study_id
                 JOIN data_collection.location as loc
                 ON svy.location_id = loc.location_id
                 WHERE svy.user_id = '${userId}'`;
    try {
        const {rows}  = await pool.query(query);
        const studiesAndSurveys = rows.map((row) => {
            const {
                study_id,
                study_title,
                protocol_version,
                study_type,
                survey_id,
                survey_title,
                time_start: start_date,
                time_stop: end_date,
                survey_location,
                location_id } = row;
            return {
                study_id,
                study_title,
                protocol_version,
                study_type,
                survey_id,
                survey_title,
                start_date,
                end_date,
                location_id,
                survey_location
            }
        }).reduce((acc, curr) => {
            const {study_id, study_title, protocol_version, study_type: type, survey_id, start_date, end_date, survey_location, location_id } = curr;
            const survey = {
                survey_id,
                study_title,
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
                    type,
                    protocol_version,
                    title: study_title,
                    surveys: [survey]
                }
            }
            return acc;
        }, {} )
        return Object.values(studiesAndSurveys);
    } catch (error) {
        console.error(`[sql ${query}] ${error}`);
        throw error;
    }
}

export function surveysForStudy(pool: pg.Pool, studyId: string) {
    const query = `SELECT
                       s.time_start, s.time_stop, u.email, s.survey_id, s.title, s.representation, s.microclimate, s.temperature_c, s.method, s.user_id, s.notes
                   FROM
                       data_collection.survey AS s
                       JOIN public.users AS u ON s.user_id = u.user_id
                   WHERE
                       s.study_id = '${studyId}'`;
    try {
        return pool.query(query);
    } catch (error) {
        console.error(`error executing sql query: ${query}`)
        throw error;
    }
}

export async function deleteStudy(pool: pg.Pool, studyId: string) {
    const tablename = await studyIdToTablename(studyId);
    const deleteStudyTable = `DROP TABLE ${tablename}`;
    const deleteStudy = `DELETE from data_collection.study
                         WHERE study_id = '${studyId}'`;
    try {
        await pool.query(deleteStudyTable);
        const {rowCount, command} = await pool.query(deleteStudy);
        if (rowCount !== 1 && command !== 'DELETE') {
            throw new Error(`Unable to delete study: ${studyId}`);
        }
    } catch(error) {
        console.error(`[sql ${deleteStudyTable}] [sql ${deleteStudy}] ${error}`);
        throw error;
    }
}

export async function createStudy(pool: pg.Pool, study: Study, fields: ActivityCountField[]) {
    // for some unknown reason import * as uuidv4 from 'uuid/v4'; uuidv4(); fails in gcp, saying that it's not a function call
    const studyTablename = studyIdToTablename(study.studyId);
    const newStudyDataTableQuery = createNewTableFromActivityCountFields(study, studyTablename, fields);
    const { studyId, title, userId, protocolVersion, type, map={} } = study;
    const newStudyMetadataQuery = `INSERT INTO data_collection.study(study_id, title, user_id, protocol_version, study_type, table_definition, tablename, map)
                                   VALUES('${studyId}', '${title}', '${userId}', '${protocolVersion}',  '${type}', '${JSON.stringify(fields)}', '${studyTablename}', '${JSON.stringify(map)}')`;
    // we want the foreign constraint to fail if we've already created a study with the specified ID
    let studyResult, newStudyDataTable;
    try {
        studyResult = await pool.query(newStudyMetadataQuery);
    } catch (error) {
        console.error(`for studyId: ${study.studyId}, ${error}, ${newStudyMetadataQuery}`);
        throw error;
    }
    try {
        newStudyDataTable = await pool.query(newStudyDataTableQuery);
    } catch (error) {
        console.error(`for studyId: ${study.studyId}, ${error}, ${newStudyDataTableQuery}`);
        throw error;
    }
    return [studyResult, newStudyDataTable];
}

export async function giveUserStudyAccess(pool: pg.Pool, userEmail: string, studyId: string) {
    const query = `INSERT INTO data_collection.surveyors
                   (SELECT coalesce
                      ((SELECT pu.user_id FROM public.users pu WHERE pu.email = '${userEmail}'),
                      '00000000-0000-0000-0000-000000000000'),
                   '${studyId}')`
    try {
        const pgRes = await pool.query(query);
        return [pgRes, null];
    } catch (error) {
        if (error.code === FOREIGN_KEY_VIOLATION) {
            const newUserId = await createUserFromEmail(pool, userEmail);
            const pgRes2 = await pool.query(query);
            return [pgRes2, newUserId];
        }
        console.error(`postgres error: ${JSON.stringify(error)}`);
        throw error;
    }
}

export async function checkUserIdIsSurveyor(pool: pg.Pool, userId: string, surveyId: string) {
    const query = `SELECT user_id, survey_id
                   FROM data_collection.survey
                   WHERE user_id = $1 and survey_id = $2`
    try {
        const values = [userId, surveyId];
        const { command, rowCount } = await pool.query(query, values);
        if (command !== 'SELECT' && rowCount !== 1) {
            return false
        }
        return true
    } catch (error) {
        console.error(`[sql ${query}] ${error}`);
        throw error;
    }
}
