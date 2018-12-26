import React, { Component, Fragment } from 'react';
import { observable, autorun, toJS, get, set } from 'mobx';

export function addRoute(route: string | any, component: (props) => any) {
    return props => {
        if (typeof route === 'string') {
            return router.uri === route ? <Fragment> {component} </Fragment> : null;
        } else {
            return route() ? <Fragment> {component} </Fragment> : null;
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
