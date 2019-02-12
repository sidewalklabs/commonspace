import React, { Component } from 'react';
import { observable, autorun } from 'mobx';
import pathToRegexp from 'path-to-regexp';
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

window.addEventListener('popstate', function (event) {
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
    const loggedOutPaths = ['/signup', '/login', '/loginWithEmail', '/reset', '/reset_password', '/privacy', '/terms', '/about', '/verify']
    const isLoggedOut = document.cookie.indexOf('commonspacepsuedo=') === -1
    if (
        isLoggedOut && !loggedOutPaths.includes(window.location.pathname)
    ) {
        return '/login';
    } else if (window.location.pathname === '/' && !isLoggedOut) {
        return '/studies';
    } else {
        const route = window.location.pathname + window.location.search
        const sanitizedRoute = route.replace(TRAILING_SLASH, '');
        return sanitizedRoute
    }
    const route = window.location.pathname + window.location.search
    return route.replace(TRAILING_SLASH, '');
}

const router: Router = observable({
    uri: sanitizedPathname()
});

autorun(async () => {
    if (router.uri === '/studies') {
        await init();
    }
});

export default router;
