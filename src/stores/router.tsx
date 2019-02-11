import React, { Component, Fragment } from 'react';
import pathToRegexp from 'path-to-regexp';
import { observable, autorun, toJS, get, set } from 'mobx';

import { init } from './applicationState';

type BooleanFunction = (...args: any[]) => boolean;
type ElementFunction = (...props: any[]) => JSX.Element

//tylermcginnis.com/react-elements-vs-react-components/
export function assignComponentToRoute(route: string | BooleanFunction, WrappedComponent: typeof Component | ElementFunction): typeof Component {
    return class Routed extends Component {
        render() {
            const { props } = this;
            if (typeof route === 'string' && pathToRegexp(route).exec(router.uri)) {
                return <WrappedComponent {...props} />
            } else if (typeof route === 'function' && route(router.uri)) {
                return <WrappedComponent {...props} />
            } else {
                return null;
            }
        }
    }
}

export function addSideEffectRoute<T>(route: string | BooleanFunction, f: (...args: any[]) => T): T {
    // @ts-ignore
    if (typeof route === 'string' && pathToRegexp(route).exec(router.uri)) {
        return f();
    } else if (typeof route === 'function' && route(router.uri)) {
        return f();
    } else {
        return null;
    }
}

window.addEventListener('popstate', function(event) {
    router.uri = sanitizedPathname()
}, false)

export function navigate(route: string) {
    history.pushState({}, '', route);
    router.uri = sanitizedPathname();
}

export interface Router {
    uri: string;
}

const TRAILING_SLASH = /\/$/
// nginx will sometimes add a trailing slash to a url
function sanitizedPathname() {
    const route = window.location.pathname + window.location.search
    return route.replace(TRAILING_SLASH, '');
}

const loggedOutPaths = ['/signup', '/login', '/welcome', '/reset', '/reset_password', '/verify']
if (
    window.location.pathname === '/' ||
    (
        document.cookie.indexOf('commonspacepsuedo=') === -1 &&
        !loggedOutPaths.includes(window.location.pathname)
    )
) {
    window.location.pathname = '/welcome';
}

const router: Router = observable({
    uri: window.location.pathname === '/' ? '/welcome' : sanitizedPathname()
});

autorun(async () => {
    console.log(router.uri);
    if (router.uri === '/studies') {
        await init();
    }
});

export default router;
