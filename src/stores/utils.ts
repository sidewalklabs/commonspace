import { snakecasePayload } from '../utils'
import authState, { logoutIfUnAuthorized } from "./auth";
import { navigate } from "./router";

export class UnauthorizedError extends Error { }

const fetchParams: RequestInit = {
    //mode: "sam", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
}

async function extractBodyFromResponse<T>(f: () => Promise<Response>): Promise<T> {
    const response: Response = await f()
    if (response.status !== 200) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    if (!response.headers.get('content-length') || parseInt(response.headers.get('content-length')) === 0) {
        return {} as T;
    }
    return response.json() as Promise<T>;
}

export const postToApi: <T>(route: string, data: any, token?: string) => Promise<T> = (route: string, data: any, token?: string) => extractBodyFromResponse(async () => {
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
        const response = await fetch(route, params)
        if (response.status == 401) {
            authState.isAuth = false;
            navigate('/login');
        } else if (response.status !== 200) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        return response;
    } catch (err) {
        console.error(`[route ${route}] [data ${body}] ${err}`)
        throw err;
    }
})

export const putToApi:<T>(route: string, data: any) => Promise<T> = (route: string, data: any, token?: string) => extractBodyFromResponse(async () => {
    const body = JSON.stringify(snakecasePayload(data))
    try {
        const response = await fetch(route, {
            ...fetchParams,
            method: "PUT",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body
        })
        if (response.status == 401) {
            authState.isAuth = false;
            navigate('/login');
        } else if (response.status !== 200) {
            throw Error(`${response.status} ${response.statusText}`);
        }
        return response;
    } catch (err) {
        console.error(`[route ${route}] [data ${body}] ${err}`)
        throw err;
    }
})

export const getFromApi: <T>(route: string) => Promise<T> = (route: string) => extractBodyFromResponse(async (): Promise<Response> => {
    try {
        const response = await fetch(route, {
            ...fetchParams,
            method: 'GET'
        })
        if (response.status === 401) {
            authState.isAuth = false;
            navigate('/login')
        } else if (response.status !== 200) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        return response;
    } catch (err) {
        console.error(`[route ${route}] ${err}`)
        throw err;
    }
})
