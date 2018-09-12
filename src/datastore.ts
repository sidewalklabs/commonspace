import * as pg from 'pg';
import { FOREIGN_KEY_VIOLATION } from 'pg-error-constants';
import * as uuid from 'uuid';

export enum StudyScale {
    district,
    city,
    cityCentre,
    neighborhood,
    blockScale,
    singleSite
}

// TODO: should each objet contain reference Ids?
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
    protocolVersion: string;
    notes?: string;
}

export interface User {
    userId: string;
    email: string;
    name: string;
}

export interface PolygonGeometry {
    type: string;
    coordinates: number[][];
}

export interface Location {
    locationId: string;
    country: string;
    city: string;
    namePrimary: string;
    subdivision: string;
    geometry: PolygonGeometry;
}

export interface Survey {
    studyId: string;
    locationId: string;
    surveyId: string;
    startDate?: string,
    endDate?: string,
    timeCharacter?: string;
    representation: string;
    microclimate?: string;
    temperatureCelcius?: number;
    method: string;
    userId?: string;
    notes?: string;
}

// todo use the uuid from user table, handle email matching outside of this
export interface StudyAccess {
    userEmail: string;
    studyId: string;
}

export type GehlFields = 'gender' | 'age' | 'mode' | 'posture' | 'activities' | 'groups' | 'objects' | 'location';

function setString(s: any) {
    return Array.from(s).toString();
}

function digitToString(d: string) {
    switch (d) {
        case '0': return 'zero';
        case '1': return 'one';
        case '2': return 'two';
        case '3': return 'three';
        case '4': return 'four';
        case '5': return 'five';
        case '6': return 'six';
        case '7': return 'seven';
        case '8': return 'eight';
        case '9': return 'nine';
        default: return d;
    }
}

function replaceDigits(s: string) {
    const asArr = s.split('-');
    const lastTwelve = asArr[asArr.length - 1];
    return Array.from(lastTwelve).slice(1).reduce((acc, curr) => acc.concat(digitToString(curr)), digitToString(lastTwelve[0]));
}

function studyIdToTablename(studyId: string) {
    return 'data_collection.study_'.concat(studyId.replace(/-/g, ''));
}

const genderLocationArray: GehlFields[] = ['gender', 'location'];
const genderLocation: Set<GehlFields> = new Set(genderLocationArray);
// to do this is very brittle, how do you now mess up objects vs object?
// also how about the connection between the enums defined at database creation time?
const allGehlFieldsArray: GehlFields[] = ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location']
const allGehlFields: Set<GehlFields> = new Set(allGehlFieldsArray);

function createNewTableFromGehlFields(study: Study, tablename: string, fields: GehlFields[]) {
    const asSet = new Set(fields);
    const comparisionString = setString(asSet);
    switch (comparisionString) {
        case setString(genderLocation):
            return `CREATE TABLE ${tablename} (
                       survey_id UUID references data_collection.survey(survey_id) NOT NULL,
                       gender data_collection.gender,
                       location geometry
                    )`;
        case setString(allGehlFields):
            return `CREATE TABLE ${tablename} (
                       survey_id UUID references data_collection.survey(survey_id) NOT NULL,
                       gender data_collection.gender,
                       age data_collection.age,
                       mode data_collection.mode,
                       posture data_collection.posture,
                       activities data_collection.activities,
                       groups data_collection.groups,
                       object data_collection.objects,
                       location geometry
                    )`;
        default:
            console.error(new Set(fields));
            throw new Error(`no table possible for selected fields: ${fields}`);
    }
}

function executeQueryInSearchPath(searchPath: string[], query: string) {
    const searchPathQuery = `SET search_path TO ${searchPath.join(', ')};`;
    return `${searchPathQuery} ${query}`;
}

// TODO an orm would be great for these .... or maybe interface magic? but an orm won't also express the relation between user and study right? we need normalized data for security reasons
// in other words the study already has the userId references, where should the idea of the study belonging to a user live? in the relationship model it's with a reference id
export async function createStudy(pool: pg.Pool, study: Study, fields: GehlFields[]) {
    // for some unknown reason import * as uuidv4 from 'uuid/v4'; uuidv4(); fails in gcp, saying that it's not a function call
    const studyTablename = studyIdToTablename(study.studyId);
    const newStudyDataTableQuery = createNewTableFromGehlFields(study, studyTablename, fields);
    const newStudyMetadataQuery = `INSERT INTO data_collection.study (study_id, title, user_id, protocol_version, table_definition, tablename)
                   VALUES ('${study.studyId}', '${study.title}', '${study.userId}', '${study.protocolVersion}', '${JSON.stringify(fields)}', '${studyTablename}')`;
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

export async function createUser(pool: pg.Pool, user: User) {
    const query = `INSERT INTO users(user_id, email, name)
                   VALUES('${user.userId}', '${user.email}', '${user.name}') `;
    return pool.query(query);
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
        console.error(`could not add user with email:  ${email}, with query: ${query}`);
        throw error;
    }
}

export async function createLocation(pool: pg.Pool, location: Location) {
    const query = `INSERT INTO data_collection.location
                   (location_id, country, city, name_primary, subdivision, geometry)
                   VALUES ('${location.locationId}', '${location.country}', '${location.city}', '${location.namePrimary}', '${location.subdivision}', ST_GeomFromGeoJSON('${JSON.stringify(location.geometry)}'))`;
    try {
        return await pool.query(query)
    } catch (error) {
        console.error(error);
        console.error(`could not add location: ${JSON.stringify(location)} with query ${query}`);
    }
}

export async function giveUserStudyAcess(pool: pg.Pool, userEmail: string, studyId: string) {
    const query = `INSERT INTO data_collection.surveyors
                  (SELECT coalesce
                     ((SELECT pu.user_id FROM public.users pu WHERE pu.email='${userEmail}'),
                     '00000000-0000-0000-0000-000000000000'),
                  '${studyId}');`
    try {
        const pgRes = await pool.query(query);
        return [pgRes, null];
    } catch (error) {
        if (error.code === FOREIGN_KEY_VIOLATION) {
            const newUserId = await createUserFromEmail(pool, userEmail);
            const pgRes2 = await pool.query(query);
            return [pgRes2, newUserId];
        }
        console.error(`postgres error: ${JSON.stringify(error)} `);
        throw error;
    }
}

export async function createNewSurveyForStudy(pool: pg.Pool, survey: Survey) {
    const query = `INSERT INTO data_collection.survey
                   (study_id, survey_id, time_start, time_stop, representation, method, user_id)
                   VALUES('${survey.studyId}', '${survey.surveyId}', '${survey.startDate}', '${survey.endDate}', '${survey.representation}', '${survey.method}', '${survey.userId}')`;
    try {
        return pool.query(query);
    } catch (error) {
        console.error(`postgres error: ${error} for query: ${query}`);
    }
}

function transformToPostgresInsert(dataPoint) {
    const columns = Object.keys(dataPoint).map(key => {
        if (key === 'groupSize') {
            return 'groups';
        } else {
            return key;
        }
    });
    const values = Object.keys(dataPoint).map(key => {
        if (key === 'location') {
            const longitude = dataPoint['location']['longitude'];
            const latitude = dataPoint['location']['latitude'];
            return `ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)`;
        } else if (key === 'groupSize') {
            switch (dataPoint['groupSize']) {
                case 'single':
                    return '\'group_1\'';
                case 'pair':
                    return '\'group_2\'';
                case 'group':
                    return '\'group_3-7\'';
                case 'crowd':
                    return '\'group_8+\'';
                default:
                    throw new Error(`invalid value for groupSize: ${dataPoint['groupSize']}`)
            }
        } else {
            return `'${dataPoint[key]}'`;
        }
    })
    return `(${(columns.join(', '))}) VALUES (${values.join(', ')})`;
}

export async function addDataPointToSurvey(pool: pg.Pool, studyId: string, surveyId: string, dataPoint: any) {
    const tablename = studyIdToTablename(studyId);
    const query = `INSERT INTO ${tablename}
                   ${transformToPostgresInsert({ survey_id: surveyId, ...dataPoint })}`;
    try {
        return pool.query(query);
    } catch (error) {
        console.error(`error executing sql query: ${query}`)
        throw error;
    }
}
