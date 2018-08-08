import * as pg from 'pg';

export enum StudyScale {
    district,
    city,
    cityCentre,
    neighborhood,
    blockScale,
    singleSite

}

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
    user_id: string;
    email: string;
    name: string;
}

export interface Survey {
    study_id: string;
    location_id: string;
    survey_id: string;
    time_character?: string;
    representation: string;
    microclimate?: string;
    temperature_c?: number;
    method: string;
    user_id?: string;
    notes?: string;
}

const pool = new pg.Pool({
    max: 1,
    host: '/cloudsql/' + connectionName,
    user: dbUser,
    password: dbPass,
    database: dbName
});

export async function createStudy(callback: any) {
    const result = await pool.query('');
    console.log(result);
}

export async function createUser(pool: pg.Pool, user: User) {
    const query = `INSERT INTO users (user_id, email, name)
                  VALUES ('${user.user_id}', '${user.email}', '${user.name}');`;
    const result = await pool.query(query);
    return result;
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
