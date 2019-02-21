export type Gender = 'male' | 'female' | 'unknown';
export type Age = 'age_0-14' | 'age_15-24' | 'age_25-64' | 'age_65+';
export type Posture = 'standing' | 'sitting_formal' | 'sitting_informal' | 'lying' | 'multiple';
export type Activity =
    | 'commercial'
    | 'consuming'
    | 'conversing'
    | 'cultural'
    | 'electronic_engagement'
    | 'recreation_active'
    | 'recreation_passive'
    | 'working_civic';
export type Group = 'group_1' | 'group_2' | 'group_3-7' | 'group_8+';

function flatMapper<T>(someMap: any, f: (key: string, index?: number) => T | undefined): T[] {
    return Object.keys(someMap)
        .map(f)
        .filter(x => x !== undefined);
}

function digitToString(d: string) {
    switch (d) {
        case '0':
            return 'zero';
        case '1':
            return 'one';
        case '2':
            return 'two';
        case '3':
            return 'three';
        case '4':
            return 'four';
        case '5':
            return 'five';
        case '6':
            return 'six';
        case '7':
            return 'seven';
        case '8':
            return 'eight';
        case '9':
            return 'nine';
        default:
            return d;
    }
}

function executeQueryInSearchPath(searchPath: string[], query: string) {
    const searchPathQuery = `SET search_path TO ${searchPath.join(', ')}; `;
    return `${searchPathQuery} ${query} `;
}
