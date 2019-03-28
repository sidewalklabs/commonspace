export type StudyField =
    | 'gender'
    | 'age'
    | 'mode'
    | 'posture'
    | 'activities'
    | 'groups'
    | 'object'
    | 'location'
    | 'notes';

export const ALL_STUDY_FIELDS: StudyField[] = [
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

export function studyIdToTablename(studyId: string) {
    return 'data_collection.study_'.concat(studyId.replace(/-/g, ''));
}

export function javascriptArrayToPostgresArray(xs) {
    const arrayElements = xs
        .map(x => {
            if (x === null) {
                throw new Error(
                    `Cannot convert ${JSON.stringify(
                        xs
                    )} into a postgres array because the array contrains the value null.`
                );
            } else if (typeof x === 'string') {
                return `${x}`;
            } else if (Array.isArray(x)) {
                return `${javascriptArrayToPostgresArray(x)}`;
            } else if (typeof x === 'object') {
                return x.toString();
            } else {
                return x;
            }
        })
        .join(', ');
    return `{${arrayElements}}`;
}

export class IdAlreadyExists extends Error {
    constructor(entityId) {
        super(entityId);
        this.message = `Id already exists: ${entityId}`;
    }
}

export class IdDoesNotExist extends Error {
    constructor(entityId) {
        super(entityId);
        this.message = `Id does not exist: ${entityId}`;
    }
}
