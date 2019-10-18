import React, { Component } from 'react';
import { observable, autorun } from 'mobx';
import pathToRegexp from 'path-to-regexp';
import { logoutUser } from '../client';

type BooleanFunction = (...args: any[]) => boolean;
type ElementFunction = (...props: any[]) => JSX.Element;

//tylermcginnis.com/react-elements-vs-react-components/
/**
 * Examines the uri, either by exact match or a user defined function to decide whether a component should render or not.
 * @param route - if a string, must exactly match the string, otherwise will apply the function to the route uri to decide if the component should render or not.
 * @param WrappedComponent - the Component to render
 */
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

/**
 * Execute some side effect whenever the application's uri matches the route or returns true for a user defined function.
 * @param route - if a string, must exactly match the string, otherwise will apply the function to the route uri to decide if the component should render or not.
 * @param f - a function that
 */
export function addSideEffectRoute(
    route: string | BooleanFunction,
    f: (...args: any[]) => void
): void {
    // @ts-ignore
    if (typeof route === 'string' && pathToRegexp(route).exec(router.uri)) {
        return f();
    } else if (typeof route === 'function' && route(router.uri)) {
        return f();
    } else {
        return null;
    }
}

/**
 * Parses a query string into a key/value dictionary of string to string.
 * @param queryString - the  part of the uri after a question mark (https://en.wikipedia.org/wiki/Query_string)
 */
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

/**
 * Handles browser history api, and also "activates" the router uri mobx store, by setting the uri part of the store. We could just update the mobx store but we would still be missing the browser interaction, this is a utility method to but down on repeated code.
 * @param route - the new uri to pass to the router state
 */
export function navigate(route: string) {
    history.pushState({}, '', route);
    router.uri = sanitizedPathname();
}

export function logoutIfError<T>(
    e: Function,
    f: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
    return async (...args) => {
        try {
            const result = await f(...args);
            return result;
        } catch (error) {
            if (error instanceof e) {
                logoutUser();
                navigate('/login');
            }
        }
    };
}

export interface Router {
    uri: string;
}

window.addEventListener(
    'popstate',
    function(event) {
        router.uri = sanitizedPathname();
    },
    false
);

const TRAILING_SLASH = /\/$/;
// nginx will sometimes add a trailing slash to a url, which leads to more check being required to check against pathname
function sanitizedPathname() {
    const route = window.location.pathname + window.location.search;
    return route.replace(TRAILING_SLASH, '');
}

const router: Router = observable({
    uri: sanitizedPathname()
});

export default router;
