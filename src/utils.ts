/**
 *  [{}, {}, ..., {}] => {{}[field]: {}, {}[field]: {}, .... {}[field]: {}}
 * take a collection and create a hash index according to a choosen field, there can only be one unique value for each key.
 */
export function groupArrayOfObjectsBy(xs: any, field: string) {
    const pairs = xs.map(x => {
        const pair = {};
        pair[x[field]] = x;
        return pair;
    });
    return Object.assign({}, ...pairs);
}

export function flatMap(xs: any[], f: any) {
    return xs.map(f).filter(x => x !== undefined && x !== null)
}
