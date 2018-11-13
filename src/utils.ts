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

export function stringHash(str) {
  var hash = 5381,
      i    = str.length;

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

export function snakecasePayload(x) {
    if (Array.isArray(x)) {
        return x.map(v => {
            if (typeof v === 'object') {
                return snakecasePayload(v);
            } else {
                return v; 
            }
        })
    } else if (typeof x === 'object') {
        const kvs = Object.keys(x).map(k => { return {key: k, value: x[k]} })
        const ys = kvs.map(({key, value}) => {
            const keySnakeCase = key.replace( /([A-Z])/g, "_$1").toLowerCase();
            let valueSnakeCase;
            if (typeof value === 'object') {
                valueSnakeCase = snakecasePayload(value);
            } else {
                valueSnakeCase = value;
            }
            const returnValue = {};
            returnValue[keySnakeCase] = valueSnakeCase; 
            return returnValue;
        })
        return Object.assign({}, ...ys); 
    } else {
        return x;
    }
}
