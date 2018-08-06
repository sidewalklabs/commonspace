import pg from 'pg';

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

// export function saveStudy(db, study: Study) {
//     db.collection('study').add({
//         ...study
//     }).then(function(docRef) {
//         const study_id = docRef.id;
//         console.log("Document written with ID: ", docRef.id);
//     }).catch(function(error) {
//         console.error("Error adding document: ", error);
//     });
// }

const pool = new pg.Pool({
    max: 1,
    host: '/cloudsql/' + connectionName,
    user: dbUser,
    password: dbPass,
    database: dbName
});

export async function insertStudy(callback: any) {
    const result = await pool.query('SELECT NOW() as now');
    console.log(result);
}

export async function insertUser(pool: pg.Pool, user: User) {
    const query = `INSERT INTO users (user_id, email, name)
                  VALUES ('${user.user_id}', '${user.email}', '${user.name}')`;
    const result = await pool.query(query);
}
