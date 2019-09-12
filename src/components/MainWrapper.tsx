import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { observer } from 'mobx-react';
import parse from 'url-parse';

import ErrorDisplay from './ErrorDisplay';

import AboutView from './AboutView';
import LoginView from './LoginView';
import LoginWithEmailView from './LoginWithEmailView';
import MainView from './Main';
import PrivacyView from './PrivacyView';
import ResetView from './ResetView';
import ResetPasswordView from './ResetPasswordView';
import SignUpView from './SignUpView';
import SplashView from './SplashView';
import TermsView from './TermsView';
import PageNotFoundView from './PageNotFoundView';
import PublicDataPortalView from './PublicDataPortalView';

import { ApplicationState } from '../stores/applicationState';
import { UiState } from '../stores/ui';
import {
    Router,
    addSideEffectRoute,
    assignComponentToRoute,
    navigate,
    queryParamsParse
} from '../stores/router';
import { getRest } from '../client';

interface MainProps {
    router: Router;
    applicationState: ApplicationState;
    uiState: UiState;
}

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        overflow: 'auto'
    }
});

const BASE_URL_MATCH = /^\/([^\/]*).*$/;

const MainWrapper = observer((props: MainProps & WithStyles) => {
    const { classes, router, uiState, applicationState } = props;
    const { uri } = router;
    const { snackBar } = uiState;

    // centralize all clientside routing logic
    const routeConfig = {
        roxanne: assignComponentToRoute('/roxanne', LoginView),
        login: assignComponentToRoute('/login', LoginView),
        signup: assignComponentToRoute('/signup', SignUpView),
        loginWithEmail: assignComponentToRoute('/loginWithEmail', LoginWithEmailView),
        reset: assignComponentToRoute('/reset', ResetView),
        welcome: assignComponentToRoute('/welcome', SplashView),
        reset_password: assignComponentToRoute('/reset_password', () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { token } = queryParamsParse(query);
            return <ResetPasswordView token={token} />;
        }),
        privacy: assignComponentToRoute('/privacy', () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { webview } = queryParamsParse(query);
            return <PrivacyView webview={webview} />;
        }),
        terms: assignComponentToRoute('/terms', () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { webview } = queryParamsParse(query);
            return <TermsView webview={webview} />;
        }),
        about: assignComponentToRoute('/about', () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { webview } = queryParamsParse(query);
            return <AboutView webview={webview} />;
        }),
        studies: assignComponentToRoute('/studies', () => (
            <MainView applicationState={applicationState} />
        )),
        study: assignComponentToRoute('/study', () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { studyId } = queryParamsParse(query);
            return <PublicDataPortalView studyId={studyId} />;
        })
    };

    const { pathname } = parse(uri);
    let Component = routeConfig[pathname.substr(1)];
    if (!Component && pathname !== '/') {
        Component = assignComponentToRoute(pathname, PageNotFoundView);
    }

    addSideEffectRoute<void>(
        () => {
            const { pathname } = parse(uri);
            return pathname === '/verify';
        },
        async () => {
            // make a call to the backend to verify the email, using the token in the uri, if successful redirect
            await getRest('/auth' + uri);
            navigate('/studies');
        }
    );
    return (
        <div className={classes.root}>
            <CssBaseline />
            <Component />
            <ErrorDisplay snackBar={snackBar} />
        </div>
    );
});

// @ts-ignore
export default withStyles(styles)(MainWrapper);
