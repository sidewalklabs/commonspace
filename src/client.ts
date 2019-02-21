import camelcaseKeys from 'camelcase-keys';
import { FeatureCollection } from 'geojson';
import fetch from "isomorphic-fetch";
import { snakecasePayload } from './utils'

export interface User {
    email: string;
    password: string;
}

export class UnauthorizedError extends Error {}
export class ResourceNotFoundError extends Error {}

type HttpFunction = (...args: any[]) => Promise<Response>

const fetchParams: RequestInit = {
    //mode: "sam", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
}

function extractBodyFromResponse<T>(f: HttpFunction): (...args: any[]) => Promise<T> {
    return (...args) => {
        return new Promise((resolve, reject) => {
            f(...args).then(async response => {
                if (response.status !== 200) {
                    throw new Error(`${response.status} ${response.statusText}`);
                }
                if (!response.headers.get('content-length') || parseInt(response.headers.get('content-length')) === 0) {
                    return {} as T;
                }
                resolve(await response.json() as T);
            }).catch(error => {
                reject(error)
            });
        })
    }
}

function handle404(f: HttpFunction): HttpFunction {
    return async (...args) => {
        const response = await f(...args)
        if (response.status === 404)
            throw new ResourceNotFoundError(`Resource not found ${response.url}`)
        return response
    }
}

function handle401(f: HttpFunction): HttpFunction {
    return async (...args) => {
        const response = await f(...args)
        if (response.status === 401)
            throw new UnauthorizedError(`Not Authorized: ${response.url}`)
        return response
    }
}

const handleAllHttpErrors: (f: HttpFunction) => HttpFunction = f =>
    (...args) =>
        throwGenericErrorIfNot200(handle401(handle404(f)))(...args)

function throwGenericErrorIfNot200(f: HttpFunction): HttpFunction {
    return async (...args) => {
        const response = await f(...args)
        if (response.status !== 200)
            throw Error(`${response.status} ${response.statusText}`)
        return response
    }
}

export const deleteRest: (uri: string, token?: string) => Promise<Response> = handleAllHttpErrors(async (uri, token) => {
    try {
        const params = {
            ...fetchParams,
            method: "DELETE",
            headers: {}
        }
        if (token) {
            params.headers['Authorization'] = `bearer ${token}`;
        }
        const response = await fetch(uri, params)
        return response;
    } catch (err) {
        console.error(`[route ${uri}] ${err}`)
        throw err;
    }
})

export const postRestNoBody: (uri: string, data: any, token?:string) => Promise<Response> = handleAllHttpErrors(async (uri, data, token) => {
    const body = JSON.stringify(snakecasePayload(data));
    try {
        const params = {
            ...fetchParams,
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body
        }
        if (token) {
            params.headers['Authorization'] = `bearer ${token}`;
        }
        const response = await fetch(uri, params)
        return response;
    } catch (err) {
        console.error(`[route ${uri}] [data ${body}] ${err}`)
        throw err;
    }
})

export const postRest: (uri: string, data: any, token?: string) => Promise<Response> = extractBodyFromResponse(postRestNoBody)

export const getRest: <T>(uri:string, token?: string) => Promise<T> = extractBodyFromResponse(handleAllHttpErrors(async (uri, token) => {
    const params = {
        ...fetchParams,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    }
    if (token) {
        params.headers['Authorization'] = `bearer ${token}`;
    }
    const response = await fetch(uri, params)
    return response
}))

export async function clearLocationsFromApi(hostname: string, fc: FeatureCollection, token: string): Promise<void> {
    try {
        await Promise.all(fc.features.map(async ({properties}) => {
            try {
                await deleteRest(hostname + `/api/locations/${properties.location_id}`, token)
            } catch (error) {
                // it's okay if it doesn't exist yet
                return
            }
        }))
    } catch (error) {
        if (!(error instanceof ResourceNotFoundError)) {
            throw error;
        }
    }
}

export async function getStudiesForAdmin(token?: string) {
    const studiesFromApi = await getRest('/api/studies?type=admin', token)
    return camelcaseKeys(studiesFromApi);
}

async function signupJwt(hostname: string, user: User) {
    const uri = `${hostname}/auth/signup`
    const requestBody = JSON.stringify(user)
    const fetchParams = {
        method: 'Post',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: 'application/bearer.token+json'
        },
        body: requestBody
    }

    const response = await fetch(uri, fetchParams)
    const responseBody = await response.json()
    return responseBody;
}

// warning this version of loginJwt swallows the error, assumes user doesn't exist
export async function loginJwt(hostname: string, user: User) {
    const uri = hostname + `/auth/login`;
    const requestBody = JSON.stringify(user);
    const fetchParams = {
        method: 'Post',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: 'application/bearer.token+json'
        },
        body: requestBody
    }
    try {
        const response = await fetch(uri, fetchParams)
        if (response.status === 401) {
            throw new Error(`not able to login user: ${JSON.stringify(user)}`)
        }
        const responseBody = await response.json()
        return responseBody as {token: string};
    } catch (error) {
        console.error(`[uri ${uri}][params ${JSON.stringify(fetchParams)}] ${error}`);
        return;
    }
}
