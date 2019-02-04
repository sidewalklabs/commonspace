import React, { Component, Fragment } from 'react';
import { observable, autorun, toJS, get, set } from 'mobx';

import { init } from './applicationState';

type BooleanFunction = (...args: any[]) => boolean;
type ElementFunction = (...props: any[]) => JSX.Element

//tylermcginnis.com/react-elements-vs-react-components/
export function addRoute(route: string | BooleanFunction, WrappedComponent: typeof Component | ElementFunction): typeof Component {
    return class Routed extends Component {
        render() {
            const { props } = this;
            if (typeof route === 'string' && router.uri === route) {
                return <WrappedComponent {...props} />
            } else if (typeof route === 'function' && route(router.uri)) {
                return <WrappedComponent {...props} />
            } else {
                return null;
            }
        }
    }
}

export function navigate(route: string) {
    // TODO: if we use pushState, we need to listen for and handle pops
    // history.pushState({}, '', route);
    window.location.pathname = route
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

const loggedOutPaths = ['/signup', '/login', '/welcome', '/reset', '/reset_password']
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
