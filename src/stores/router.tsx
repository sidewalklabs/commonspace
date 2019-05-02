import React, { Component } from 'react';
import { observable, autorun } from 'mobx';
import pathToRegexp from 'path-to-regexp';
import { init, initCurrentStudy } from './applicationState';
import parse from 'url-parse';

type BooleanFunction = (...args: any[]) => boolean;
type ElementFunction = (...props: any[]) => JSX.Element;

//tylermcginnis.com/react-elements-vs-react-components/
export function assignComponentToRoute(
    route: string | BooleanFunction,
    WrappedComponent: typeof Component | ElementFunction
): typeof Component {
    return class Routed extends Component {
        render() {
            const { props } = this;
            if (typeof route === 'string') {
                return <WrappedComponent {...props} />;
            } else if (typeof route === 'function' && route(router.uri)) {
                return <WrappedComponent {...props} />;
            } else {
                return null;
            }
        }
    };
}

export function addSideEffectRoute<T>(
    route: string | BooleanFunction,
    f: (...args: any[]) => T
): T {
    // @ts-ignore
    if (typeof route === 'string' && pathToRegexp(route).exec(router.uri)) {
        return f();
    } else if (typeof route === 'function' && route(router.uri)) {
        return f();
    } else {
        return null;
    }
}

// Parses a query string into a key/value dictionary
export function queryParamsParse(queryString: string) {
    const asArr = queryString.substr(1).split('&');
    // put them into a dictionary
    return asArr.reduce((acc, s) => {
        const [key, value] = s.split('=');
        const next = {};
        let nextValue = value;

        if (value === 'true' || value === 'false') {
            nextValue = JSON.parse(String(value));
        }

        next[key] = nextValue;
        return {
            ...acc,
            ...next
        };
    }, {});
}

window.addEventListener(
    'popstate',
    function(event) {
        router.uri = sanitizedPathname();
    },
    false
);

export function navigate(route: string) {
    history.pushState({}, '', route);
    router.uri = sanitizedPathname();
}

export function logoutIfError<T>(
    eC: Function,
    f: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
    return async (...args) => {
        try {
            const result = await f(...args);
            return result;
        } catch (error) {
            if (error instanceof eC) {
                navigate('/login');
            }
        }
    };
}

export interface Router {
    uri: string;
}

const TRAILING_SLASH = /\/$/;
// nginx will sometimes add a trailing slash to a url
function sanitizedPathname() {
    const route = window.location.pathname + window.location.search;
    if (route === '/') {
        window.location.pathname = '/welcome';
        return;
    }
    return route.replace(TRAILING_SLASH, '');
}

const router: Router = observable({
    uri: sanitizedPathname()
});

autorun(async () => {
    const uri = parse(router.uri);
    const { pathname, query } = uri;

    if (pathname === '/studies') {
        await init();
    } else if (pathname === '/study') {
        // @ts-ignore
        const { studyId } = queryParamsParse(query);
        await initCurrentStudy(studyId);
    }
});

export default router;
