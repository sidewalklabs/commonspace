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

export interface Survey {
    studyId: string;
    locationId: string;
    surveyId: string;
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

const genderLocationArray: GehlFields[] = ['gender', 'location'];
const genderLocation: Set<GehlFields> = new Set(genderLocationArray);
const allGehlFieldsArray: GehlFields[] = ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'objects', 'location']
const allGehlFields: Set<GehlFields> = new Set(allGehlFieldsArray);

function createNewTableFromGehlFields(study: Study, tablename: string, fields: GehlFields[]) {
    const asSet = new Set(fields);
    const comparisionString = setString(asSet);
    switch (comparisionString) {
        case setString(genderLocation):
            return `CREATE TABLE "data_collection.${tablename}" (
                       survey_id UUID references data_collection.survey(survey_id),
                       gender data_collection.gender,
                       location geography
                   )`;
        case setString(allGehlFields):
            return `CREATE TABLE "data_collection.${tablename}" (
                       survey_id UUID references data_collection.survey(survey_id),
                       gender data_collection.gender,
                       age data_collection.age,
                       mode data_collection.mode,
                       posture data_collection.posture,
                       activities data_collection.activities,
                       groups data_collection.groups,
                       objects data_collection.objects,
                       location geography
               )`;
        default:
            console.error(new Set(fields));
            throw new Error(`no table possible for selected fields: ${fields}`);
    }
}

// TODO an orm would be great for these .... or maybe interface magic? but an orm won't also express the relation between user and study right? we need normalized data for security reasons
// in other words the study already has the userId references, where should the idea of the study belonging to a user live? in the relationship model it's with a reference id
export async function createStudy(pool: pg.Pool, study: Study, fields: GehlFields[]) {
    // for some unknown reason uuidv4() fails in gcp, saying that it's not a function call
    const studyTablename = study.studyId;
    const newStudyDataTableQuery = createNewTableFromGehlFields(study, study.studyId, fields);
    const newStudyMetadataQuery = `INSERT INTO data_collection.study (study_id, title, user_id, protocol_version, table_definition, tablename)
                   VALUES ('${study.studyId}', '${study.title}', '${study.userId}', '${study.protocolVersion}', '${JSON.stringify(fields)}', '${studyTablename}')`;
    // we want the foreign constraint to fail if we've already created a study with the specified ID
    const studyResult = await pool.query(newStudyMetadataQuery);
    const newStudyDataTable = await pool.query(newStudyDataTableQuery);
    return [studyResult, newStudyDataTable];
}

export async function createUser(pool: pg.Pool, user: User) {
    const query = `INSERT INTO users (user_id, email, name)
                  VALUES ('${user.userId}', '${user.email}', '${user.name}');`;
    return pool.query(query);
}

export async function createUserFromEmail(pool: pg.Pool, email: string) {
    const userId = uuid.v4();
    const query = `INSERT INTO users (user_id, email)
                   VALUES ('${userId}', '${email} ')`;
    await pool.query(query);
    return userId;
}

export async function giveUserStudyAcess(pool: pg.Pool, userEmail: string, studyId: string) {
    const query = `INSERT INTO data_collection.surveyors 
                   ( user_id, study_id )
                   SELECT pu.user_id, '${studyId}'
                   FROM public.users pu
                   WHERE pu.email= '${userEmail}'`;
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

export async function createNewSurveyForStudy(pool: pg.Pool, survey: Survey) {
    const query = `INSERT INTO data_collection.survey
                   (study_id, survey_id, representation, method, user_id)
                   VALUES ('${survey.studyId}', '${survey.surveyId}', 'absolute', 'analog','${survey.userId}')`;
    return pool.query(query);
}

export async function addDataPointToSurvey() {

}
