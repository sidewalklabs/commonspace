import camelcaseKeys from 'camelcase-keys';
import urls from '../config/urls';

export function snakecasePayload(x) {
  if (Array.isArray(x)) {
    return x.map(v => {
      if (typeof v === 'object') {
        return snakecasePayload(v);
      }
      return v;
    });
  }
  if (typeof x === 'object') {
    const kvs = Object.keys(x).map(k => ({ key: k, value: x[k] }));
    const ys = kvs.map(({ key, value }) => {
      const keySnakeCase = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      let valueSnakeCase;
      if (value !== null && typeof value === 'object') {
        valueSnakeCase = snakecasePayload(value);
      } else {
        valueSnakeCase = value;
      }
      const returnValue = {};
      returnValue[keySnakeCase] = valueSnakeCase;
      return returnValue;
    });
    return Object.assign({}, ...ys);
  }
  return x;
}

const fetchParams = {
  mode: 'cors', // no-cors, cors, *same-origin
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'same-origin', // include, same-origin, *omit
  redirect: 'follow',
  referrer: 'no-referrer',
};

export async function logOut(token) {
  const response = await fetch(`${urls.apiBase}/auth/logout`, {
    ...fetchParams,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (response.status !== 200) {
    throw new Error(`Unable to log out`);
  }
}

export async function logInUserWithGoogleAccessToken(accessToken) {
  const response = await fetch(`${urls.apiBase}/auth/google/token`, {
    ...fetchParams,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/bearer.token+json',
      'access-token': `${accessToken}`,
    },
  });
  const body = await response.json();
  if (response.status !== 200) {
    throw new Error(`Unable to Log In: ${body.error_message}`);
  } else {
    return body.token;
  }
}

export async function logInUser(email, password) {
  const data = {
    password,
    email,
  };
  const response = await fetch(`${urls.apiBase}/auth/login`, {
    ...fetchParams,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/bearer.token+json',
    },
    body: JSON.stringify(data),
  });

  const body = await response.json();
  if (response.status !== 200) {
    throw new Error(`Unable to Log In: ${body.error_message}`);
  }
  return body.token;
}

export async function signUpUser(email, password) {
  const data = {
    password,
    email,
  };

  const response = await fetch(`${urls.apiBase}/auth/signup`, {
    ...fetchParams,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/bearer.token+json',
    },
    body: JSON.stringify(data),
  });

  const body = await response.json();
  if (response.status !== 200) {
    throw new Error(`Unable to Sign Up: ${body.error_message}`);
  }
  return body.token;
}

export async function sendPasswordResetEmail(email) {
  const data = { email };
  const response = await fetch(`${urls.apiBase}/auth/request_reset_password`, {
    ...fetchParams,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  });

  const body = await response.json();
  if (response.status !== 200) {
    throw new Error(`Unable to Reset Password: ${body.error_message}`);
  } else {
    return true;
  }
}

export async function getStudies(token) {
  const response = await fetch(`${urls.apiBase}/api/studies?type=surveyor`, {
    ...fetchParams,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `bearer ${token}`,
    },
  });
  if (response.status === 401) {
    throw new Error('Unauthorized. Please sign in again');
  } else if (response.status !== 200) {
    throw new Error('Unable to load your studies. Only demo studies will be available.');
  }
  const body = await response.json();
  const studies = camelcaseKeys(body, { deep: true });
  const activeStudies = studies.filter(study => study.status !== 'completed');
  return activeStudies;
}

// modifies an existing data point
export async function updateDataPoint(token, surveyId, dataPoint) {
  const { dataPointId } = dataPoint;
  const url = `${urls.apiBase}/api/surveys/${surveyId}/datapoints/${dataPointId}`;
  let body;
  if (dataPoint.location) {
    const { longitude, latitude } = dataPoint.location;
    body = {
      ...dataPoint,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    };
  } else {
    body = dataPoint;
  }

  const response = await fetch(url, {
    ...fetchParams,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify(snakecasePayload(body)),
  });
  if (response.status === 401) {
    throw new Error('Unauthorized. Please sign in again');
  } else if (response.status !== 200) {
    throw new Error('Could not save new data point');
  }
}

// use to create new data points
export async function saveNewDataPoint(token, surveyId, dataPoint) {
  const url = `${urls.apiBase}/api/surveys/${surveyId}/datapoints/`;
  let body;
  if (dataPoint.location) {
    const { longitude, latitude } = dataPoint.location;
    body = {
      ...dataPoint,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    };
  } else {
    body = dataPoint;
  }

  const response = await fetch(url, {
    ...fetchParams,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify(snakecasePayload(body)),
  });
  if (response.status === 401) {
    throw new Error('Unauthorized. Please sign in again');
  } else if (response.status !== 200) {
    throw new Error('Could not save new data point');
  }
}

export async function deleteDataPoint(token, surveyId, dataPointId) {
  const url = `${urls.apiBase}/api/surveys/${surveyId}/datapoints/${dataPointId}`;
  const response = await fetch(url, {
    ...fetchParams,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `bearer ${token}`,
    },
  });
  if (response.status === 401) {
    throw new Error('Unauthorized. Please sign in again');
  } else if (response.status !== 200) {
    throw new Error('Could not delete data point');
  }
}

export async function getDataPointsforSurvey(token, surveyId) {
  const url = `${urls.apiBase}/api/surveys/${surveyId}/datapoints`;
  const response = await fetch(url, {
    ...fetchParams,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `bearer ${token}`,
    },
  });
  if (response.status === 401) {
    throw new Error('Unauthorized. Please sign in again');
  } else if (response.status !== 200) {
    throw new Error('Could not fetch existing data points for study');
  }
  const body = await response.json();
  const dataPoints = camelcaseKeys(body, { deep: true }).map(d => {
    if (d.location && d.location.coordinates) {
      const [longitude, latitude] = d.location.coordinates;
      d.location = { latitude, longitude };
    }
    return d;
  });

  const sortedDataPoints = dataPoints.sort((dp1, dp2) => {
    const a = new Date(dp1.creationDate);
    const b = new Date(dp2.creationDate);
    return a < b ? -1 : a > b ? 1 : 0;
  });

  return sortedDataPoints;
}
