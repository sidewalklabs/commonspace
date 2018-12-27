import React, { Component, Fragment } from 'react';
import { observable, autorun, toJS, get, set } from 'mobx';


type BooleanFunction = (...args: any[]) => boolean;

export function addRoute(route: string | BooleanFunction, WrappedComponent: typeof Component): typeof Component {
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
    history.pushState({}, '', route);
    router.uri = window.location.pathname;
}

export interface Router {
    uri: string;
}

const router: Router = observable({
    uri: '/signup'
});

autorun(() => console.log(router.uri));

export default router;
