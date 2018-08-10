import * as pg from 'pg';

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

export type GehlFields = 'gender' | 'location';

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

const genderLocation: any = new Set(['gender', 'location']);

function createNewTableFromGehlFields(study: Study, fields: GehlFields[]) {
    const asSet = new Set(fields);
    const comparisionString = setString(asSet);
    switch (comparisionString) {
        case setString(genderLocation):
            return `CREATE TABLE data_collection.${replaceDigits(study.studyId)} (
                       survey_id UUID references data_collection.survey(survey_id),
                       gender data_collection.gender,
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
    const newStudyMetadataQuery = `INSERT INTO data_collection.study (study_id, title, user_id, protocol_version)
                   VALUES ('${study.studyId}', '${study.title}', '${study.userId}', '1.0')`;
    const studyResult = await pool.query(newStudyMetadataQuery);
    console.log('study result: ', studyResult);
    const newStudyDataTableQuery = createNewTableFromGehlFields(study, fields);
    const newStudyDataTable = await pool.query(newStudyDataTableQuery);
    console.log('new table: ', newStudyDataTable);
    return [studyResult, newStudyDataTable];
}

export async function createUser(pool: pg.Pool, user: User) {
    const query = `INSERT INTO users (user_id, email, name)
                  VALUES ('${user.userId}', '${user.email}', '${user.name}');`;
    console.log('query:', query);
    return pool.query(query);
}

export async function giveUserSurveyAcess(pool: pg.Pool, user: User) {
    const query = `INSERT INTO survey_users (survey_id, user_id)
                  VALUES ();`;
    const result = await pool.query(query);
    return result;
}

export async function createNewSurvey() {
    return 'hi';
}

export async function addDataPointToSurvey() {

}
