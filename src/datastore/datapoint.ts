import { Pool } from 'pg';
import { javascriptArrayToPostgresArray, studyIdToTablename, StudyField } from './utils';
import { IdNotFoundError } from './location';

interface DataPoint {
    surveyId: string;
    dataPointId: string;
    creationDate?: string;
    lastUpdated?: string;
    gender?: string;
    age?: string;
    mode?: string;
    posture?: string;
    activities?: string[];
    groups?: string;
    object?: string;
    location?: string;
    notes?: string;
}

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
    'notes'
]);

const allStudyFieldsArray: StudyField[] = [
    'gender',
    'age',
    'mode',
    'posture',
    'activities',
    'groups',
    'object',
    'location',
    'notes'
];
const allStudyFields: Set<StudyField> = new Set(allStudyFieldsArray);
const allStudyFieldsStrings: Set<string> = allStudyFields;

function wrapInArray<T>(x: T | T[]) {
    if (Array.isArray(x)) {
        return x;
    } else {
        return [x];
    }
}

export async function getTablenameForSurveyId(pool: Pool, surveyId: string) {
    const query = `SELECT tablename
                   FROM  data_collection.survey_to_tablename
                   WHERE survey_id = $1`;
    const values = [surveyId];
    try {
        const pgRes = await pool.query(query, values);
        if (pgRes.rowCount === 1) {
            return pgRes.rows[0]['tablename'];
        } else {
            throw new Error(`no tablename found for surveyId: ${surveyId}`);
        }
    } catch (error) {
        console.error(`[query ${query}] [values ${values}] ${error}`);
        throw error;
    }
}

function processDataPointToValue(key, value): any[] | any {
    if (key === 'location') {
        const location = value;
        if (location.type && location.type === 'Point') {
            //return `ST_GeomFromGeoJSON('${JSON.stringify(location)}')`;
            //return `ST_GeomFromGeoJSON('${JSON.stringify(location)}')`;
            return JSON.stringify(location);
        } else {
            const { longitude, latitude } = location;
            return [longitude, latitude];
            //return `ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)`;
        }
    } else if (key === 'activities') {
        const activities = value;
        const activitesAsArr = javascriptArrayToPostgresArray(wrapInArray(activities));
        return `${activitesAsArr}`;
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

function convertKeyToParamterBinding(index, key, value) {
    if (key === 'location') {
        let binding;
        const location = value;
        if (location.type && location.type === 'Point') {
            binding = `ST_GeomFromGeoJSON($${index})`;
            return { index: index + 1, binding };
        } else {
            binding = `ST_GeomFromText($${index}, $${index + 1})`;
            return { index: index + 2, binding };
        }
    } else {
        const binding = `$${index}`;
        return { index: index + 1, binding };
    }
}

function deleteNonStudyFields(o: any) {
    const unwantedKeys = Object.keys(o).filter(x => !allStudyFieldsStrings.has(x) || o[x] === null);
    unwantedKeys.forEach(k => delete o[k]);
    return o;
}

function processDataPointToPreparedStatement(
    acc: { columns: string[]; values: string[]; parameterBindings: string[]; index: number },
    curr: { key: string; value: string }
) {
    const { key, value } = curr;
    const { columns, values, parameterBindings } = acc;
    columns.push(key);
    const { binding, index } = convertKeyToParamterBinding(acc.index, key, value);
    parameterBindings.push(binding);
    return {
        columns,
        values: [...values, ...wrapInArray(processDataPointToValue(key, value))],
        parameterBindings,
        index
    };
}

function processKeyAndValues(dataPoint) {
    const kvs = Object.entries(dataPoint).map(([key, value]) => {
        return { key, value };
    });
    return kvs.reduce(processDataPointToPreparedStatement, {
        columns: [],
        values: [],
        parameterBindings: [],
        index: 1
    });
}

function transformToPostgresUpdate(surveyId: string, dataPoint) {
    const { data_point_id, last_updated } = dataPoint;
    const dataPointForPostgres = deleteNonStudyFields(dataPoint);
    dataPointForPostgres.survey_id = surveyId;
    dataPointForPostgres.data_point_id = data_point_id;
    dataPointForPostgres.last_updated = last_updated;
    const { columns, values, parameterBindings } = processKeyAndValues(dataPointForPostgres);
    const insert_statement = `(${columns.join(', ')}) VALUES (${parameterBindings.join(', ')})`;
    const query = `${insert_statement}
                   ON CONFLICT (data_point_id)
                   DO UPDATE SET (${columns.join(', ')}) = (${parameterBindings.join(', ')})`;
    return { query, values };
}

function transformToPostgresInsert(surveyId: string, dataPoint) {
    const { data_point_id, creation_date, last_updated } = dataPoint;
    const dataPointForPostgres = deleteNonStudyFields(dataPoint);
    dataPointForPostgres.survey_id = surveyId;
    dataPointForPostgres.data_point_id = data_point_id;
    dataPointForPostgres.last_updated = last_updated;
    dataPointForPostgres.creation_date = creation_date;
    const { columns, values, parameterBindings } = processKeyAndValues(dataPointForPostgres);
    const query = `(${columns.join(', ')}) VALUES (${parameterBindings.join(', ')})`;
    return { query, values };
}

export async function addNewDataPointToSurveyNoStudyId(pool, surveyId: string, dataPoint: any) {
    const tablename = await getTablenameForSurveyId(pool, surveyId);
    const dataPointWithSurveyId = { ...dataPoint, survey_id: surveyId };
    let { query, values } = transformToPostgresInsert(surveyId, dataPointWithSurveyId);
    query = `INSERT INTO ${tablename}
             ${query}`;
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function updateDataPointForSurveyNoStudyId(
    pool: Pool,
    surveyId: string,
    dataPoint: any
) {
    const tablename = await getTablenameForSurveyId(pool, surveyId);
    const dataPointWithSurveyId = { ...dataPoint, survey_id: surveyId };
    let { query, values } = transformToPostgresUpdate(surveyId, dataPointWithSurveyId);
    query = `INSERT INTO ${tablename}
             ${query}`;
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function addDataPointToSurveyWithStudyId(
    pool: Pool,
    studyId: string,
    surveyId: string,
    dataPoint: any
) {
    const tablename = await studyIdToTablename(studyId);
    const dataPointWithSurveyId = { ...dataPoint, survey_id: surveyId };
    let { query, values } = transformToPostgresInsert(surveyId, dataPointWithSurveyId);
    query = `INSERT INTO ${tablename}
             ${query}`;
    try {
        await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}]: ${error}`);
        throw error;
    }
}

export async function getDataPointsForStudy(
    pool: Pool,
    userId: string,
    studyId: string
): Promise<DataPoint[]> {
    const fieldsQuery = `SELECT study_id, fields, tablename
                         FROM data_collection.study
                         WHERE study_id = $1 and user_id =$2`;
    const fieldsValues = [studyId, userId];
    try {
        const { rows, rowCount } = await pool.query(fieldsQuery, fieldsValues);
        if (rowCount !== 1) {
            throw new IdNotFoundError(studyId);
        }

        const { fields, tablename } = rows[0];
        const formattedFields = fields.map(field => {
            return field === 'activities' ? `array_to_json(activities) as activities` : field;
        });
        const fieldsAsColumns = ['data_point_id', 'creation_date', 'last_updated']
            .concat(formattedFields)
            .join(', ');
        const dataPointsQuery = `SELECT ${fieldsAsColumns}
                                 FROM ${tablename}`;
        const { rows: datapoints } = await pool.query(dataPointsQuery);
        return datapoints as DataPoint[];
    } catch (error) {
        console.error(
            `[fieldsQuery ${fieldsQuery}][fieldsValues ${JSON.stringify(fieldsValues)}] ${error}`
        );
    }
}

export async function getDataPointsCSV(
    pool: Pool,
    userId: string,
    studyId: string
): Promise<DataPoint & { zone: string }[]> {
    const fieldsQuery = `SELECT study_id, fields, tablename
                         FROM data_collection.study
                         WHERE study_id = $1 and user_id =$2`;
    const fieldsValues = [studyId, userId];
    try {
        const { rows, rowCount } = await pool.query(fieldsQuery, fieldsValues);
        if (rowCount !== 1) {
            throw new IdNotFoundError(studyId);
        }

        const { fields, tablename } = rows[0];
        const formattedFields = fields.map(field => {
            return field === 'activities' ? `array_to_json(activities) as activities` : field;
        });
        const tableRefName = 'tbl';
        const fieldsAsColumns = ['data_point_id', 'creation_date', 'last_updated']
            .concat(formattedFields)
            .map(f => tableRefName + '.' + f)
            .join(', ');
        const dataPointsQuery = `SELECT ${fieldsAsColumns}, ST_AsGeoJSON(location)::json as coordinates, name_primary as zone
                                 FROM ${tablename} ${tableRefName}
                                 JOIN data_collection.survey sur
                                 ON ${tableRefName}.survey_id = sur.survey_id
                                 LEFT JOIN data_collection.location loc
                                 ON sur.location_id = loc.location_id
                                 `;
        try {
            const { rows: datapoints } = await pool.query(dataPointsQuery);
            return datapoints as DataPoint & { zone: string }[];
        } catch (error) {
            console.error(`[query ${dataPointsQuery}] ${error}`);
        }
    } catch (error) {
        console.error(
            `[fieldsQuery ${fieldsQuery}][fieldsValues ${JSON.stringify(fieldsValues)}] ${error}`
        );
    }
}

export async function getDataPointsForSurvey(pool, surveyId) {
    const tablename = await getTablenameForSurveyId(pool, surveyId);

    const query = `SELECT data_point_id, gender, age, mode, posture, activities, groups, object, creation_date, last_updated, ST_AsGeoJSON(location)::json as loc, notes
                   FROM ${tablename}
                   WHERE survey_id = $1`;
    const values = [surveyId];

    try {
        const res = await pool.query(query, values);
        return res.rows.map(r => {
            const { loc: location } = r;
            delete r['loc'];
            return {
                ...r,
                location
            };
        });
    } catch (error) {
        console.error(`[sql ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function deleteDataPoint(pool: Pool, surveyId: string, dataPointId: any) {
    const tablename = await getTablenameForSurveyId(pool, surveyId);
    const query = `DELETE FROM ${tablename}
                   WHERE data_point_id = $1`;
    const values = [dataPointId];
    try {
        const res = await pool.query(query, values);
        const { rowCount } = res;
        if (rowCount !== 1) {
            throw new Error(
                `[query ${query}] No data point found to delete for data_point_id: ${dataPointId}`
            );
        }
        return res;
    } catch (error) {
        console.error(`[ query ${query}] ${error}`);
        throw error;
    }
}
