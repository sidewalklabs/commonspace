import * as pg from 'pg';
import { studyIdToTablename, ActivityCountField } from './utils'; 

const validDataPointProperties = new Set([
    'survey_id',
    'data_point_id',
    'gender',
    'age',
    'mode',
    'posture',
    'activities',
    'groups',
    'object',
    'location',
    'creation_date',
    'last_updated',
    'note'
]);


const allActivityCountFieldsArray: ActivityCountField[] = ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'object', 'location', 'creation_date', 'last_updated', 'note'];
const allActivityCountFields: Set<ActivityCountField> = new Set(allActivityCountFieldsArray);
const allActivityCountFieldsStrings: Set<string> = allActivityCountFields;


export async function getTablenameForSurveyId(pool: pg.Pool, surveyId: string) {
    const query = `SELECT tablename
                   FROM  data_collection.survey_to_tablename
                   WHERE survey_id = '${surveyId}'`;
    let pgRes;
    try {
        pgRes = await pool.query(query);
    } catch (error) {
        console.error(`postgres error: ${error} for query: ${query} `);
        throw error;
    }
    if (pgRes.rowCount === 1) {
        return pgRes.rows[0]['tablename'];
    } else {
        throw new Error(`no tablename found for surveyId: ${surveyId}, ${JSON.stringify(pgRes)}`);
    }
}

export function javascriptArrayToPostgresArray(xs) {
    const arrayElements = xs.map(x => {
        if (x === null) {
            throw new Error(`Cannot convert ${JSON.stringify(xs)} into a postgres array because the array contrains the value null.`)
        }
        else if (typeof x === 'string') {
            return `${x}`;
        } else if (Array.isArray(x)) {
            return `${javascriptArrayToPostgresArray(x)}`
        } else if (typeof x === 'object') {
            return x.toString();
        } else {
            return x;
        }
    }).join(', ');
    return `{${arrayElements}}`;
}


function processDataPointToValue(key, value): any[] | any {
    if (key === 'location') {
        const location = value;
        if (location.type && location.type === "Point") {
            //return `ST_GeomFromGeoJSON('${JSON.stringify(location)}')`;
            //return `ST_GeomFromGeoJSON('${JSON.stringify(location)}')`;
            return JSON.stringify(location);
        } else {
            const { longitude, latitude} = location
            return [longitude, latitude];
            //return `ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)`;
        }
    } else if (key === 'groups') {
        switch (value) {
            case 'single':
                return 'group_1';
            case 'pair':
                return 'group_2';
            case 'group':
                return 'group_3-7';
            case 'crowd':
                return 'group_8+';
            default:
                throw new Error(`invalid value for groups: ${value}`)
        }
    } else if (key === 'age') {
        switch (value) {
            case 'child':
                return '0-14';
            case 'young':
                return '15-24';
            case 'adult':
                return '25-64';
            case 'elderly':
                return '65+';
            default:
                throw new Error(`invalid value for age: ${value}`)
        }
    } else if (key === 'activities') {
        const activities = value;
        const activitesAsArr = Array.isArray(activities) ? activities : [activities];
        return `${javascriptArrayToPostgresArray(activitesAsArr)}`;
    } else if (validDataPointProperties.has(key)) {
        // if (value === null || value === undefined) {
        //     return '';
        // }
        return `${value}`;
        //return value;
    } else {
        throw new Error(`Unexpected key ${key} in data point`);
    }
}

function wrapInArray<T>(x: T | T[]) {
    if (Array.isArray(x)) {
        return x;
    } else {
        return [x];
    }
}

function convertKeyToParamterBinding(index, key, value) {
    if (key === 'location') {
        let binding;
        const location = value;
        if (location.type && location.type === 'Point') {
            binding = `ST_GeomFromGeoJSON($${index})`
            return { index: index + 1, binding };
        } else {
            binding = `ST_GeomFromText($${index}, $${index+1})`
            return { index: index + 2, binding };
        }
    } else {
        const binding = `$${index}`
        return {index: index + 1, binding };
    }
}

function deleteNonActivityCountFields(o: any) {
    const unwantedKeys = Object.keys(o).filter(x => !allActivityCountFieldsStrings.has(x) || o[x] === null)
    unwantedKeys.forEach(k => delete o[k]);
    return o;
}

function processDataPointToPreparedStatement(acc: {columns: string[], values: string[], parameterBindings: string[], index: number}, curr: {key: string, value: string}) {
    const { key, value } = curr;
    const { columns, values, parameterBindings } = acc;
    columns.push(key);
    const { binding, index } = convertKeyToParamterBinding(acc.index, key, value);
    parameterBindings.push(binding)
    return {
        columns,
        values: [...values, ...wrapInArray(processDataPointToValue(key, value))],
        parameterBindings,
        index
    }
}

function processKeyAndValues(dataPoint) {
    const kvs = Object.entries(dataPoint).map(([key, value]) => { return { key, value } });
    return kvs.reduce(processDataPointToPreparedStatement, {
        columns: [],
        values: [],
        parameterBindings: [],
        index: 1
    });
}

function transformToPostgresInsert(surveyId: string, dataPoint) {
    const { data_point_id } = dataPoint;
    const dataPointForPostgres = deleteNonActivityCountFields(dataPoint);
    dataPointForPostgres.survey_id = surveyId;
    dataPointForPostgres.data_point_id = data_point_id;
    const { columns, values, parameterBindings } = processKeyAndValues(dataPointForPostgres);
    const insert_statement = `(${(columns.join(', '))}) VALUES (${parameterBindings.join(', ')})`;
    const query = `${insert_statement}
            ON CONFLICT(data_point_id)
            DO UPDATE SET(${(columns.join(', '))}) = (${parameterBindings.join(', ')})`;
    return { query, values };
}

export async function addDataPointToSurveyNoStudyId(pool: pg.Pool, surveyId: string, dataPoint: any) {
    const tablename = await getTablenameForSurveyId(pool, surveyId);
    const dataPointWithSurveyId =  { ...dataPoint, survey_id: surveyId  };
    let { query, values } = transformToPostgresInsert(surveyId, dataPointWithSurveyId)
    query = `INSERT INTO ${tablename}
                   ${query}`;
    try {
        return pool.query(query, values);
    } catch (error) {
        console.error(`[sql ${query}] ${error}`)
        throw error;
    }
}

export async function addDataPointToSurveyWithStudyId(pool: pg.Pool, studyId: string, surveyId: string, dataPoint: any) {
    const tablename = await studyIdToTablename(studyId);
    const dataPointWithSurveyId =  { ...dataPoint, survey_id: surveyId };
    let { query, values } = transformToPostgresInsert(surveyId, dataPointWithSurveyId);
    query = `INSERT INTO ${tablename}
                   ${query}`;
    try {
        return pool.query(query, values);
    } catch (error) {
        console.error(`error executing sql query: ${query}`)
        throw error;
    }
}

export async function retrieveDataPointsForSurvey(pool, surveyId) {
    const tablename = await getTablenameForSurveyId(pool, surveyId);
    const query = `SELECT data_point_id, gender, age, mode, posture, activities, groups, object, ST_AsGeoJSON(location)::json as loc, note
                   FROM ${tablename}`
    try {
        const res = await pool.query(query);
        return res.rows.map(r => {
            const { loc: location } = r;
            delete r['loc'];
            return {
                ...r,
                location
            };
        });;
    } catch (error) {
        console.error(`[sql ${query}] ${error}`)
        throw error;
    }
}

export async function deleteDataPoint(pool: pg.Pool, surveyId: string, dataPointId: any) {
    const tablename = await getTablenameForSurveyId(pool, surveyId);
    const query = `DELETE FROM ${tablename}
                   WHERE data_point_id = '${dataPointId}'`;
    try {
        const res = await pool.query(query);
        const { rowCount } = res;
        if (rowCount !== 1) {
            throw new Error(`[query ${query}] No data point found to delete for data_point_id: ${dataPointId}`)
        }
        return res;
    } catch (error) {
        console.error(`[ query ${query}] ${error}`)
        throw error;
    }
}
