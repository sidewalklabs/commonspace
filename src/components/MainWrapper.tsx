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
import TermsView from './TermsView';

import { ApplicationState } from '../stores/applicationState';
import { UiState } from '../stores/ui';
import { Router, addSideEffectRoute, assignComponentToRoute, navigate } from '../stores/router';
import { getFromApi } from '../stores/utils';

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

function queryParamsParse(queryString: string) {
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

const BASE_URL_MATCH = /^\/([^\/]*).*$/;

const MainWrapper = observer((props: MainProps & WithStyles) => {
    const { classes, router, uiState, applicationState } = props;
    const { uri } = router;
    const { snackBar } = uiState;
    const Login = assignComponentToRoute('/login', LoginView);
    const SignUp = assignComponentToRoute('/signup', SignUpView);
    const LoginWithEmail = assignComponentToRoute('/loginWithEmail', LoginWithEmailView);
    const Reset = assignComponentToRoute('/reset', ResetView);
    const ResetPassword = assignComponentToRoute(
        () => {
            const { pathname } = parse(uri);
            return pathname === '/reset_password';
        },
        () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { token } = queryParamsParse(query);
            return <ResetPasswordView token={token} />;
        }
    );

    const Privacy = assignComponentToRoute(
        () => {
            const { pathname } = parse(uri);
            return pathname === '/privacy';
        },
        () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { webview } = queryParamsParse(query);
            return <PrivacyView webview={webview} />;
        }
    );

    const Terms = assignComponentToRoute(
        () => {
            const { pathname } = parse(uri);
            return pathname === '/terms';
        },
        () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { webview } = queryParamsParse(query);
            return <TermsView webview={webview} />;
        }
    );

    const About = assignComponentToRoute(
        () => {
            const { pathname } = parse(uri);
            return pathname === '/about';
        },
        () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { webview } = queryParamsParse(query);
            return <AboutView webview={webview} />;
        }
    );

    addSideEffectRoute<void>(
        () => {
            const { pathname } = parse(uri);
            return pathname === '/verify';
        },
        async () => {
            const { query } = parse(uri);
            // @ts-ignore
            const { token, email } = queryParamsParse(query);
            await getFromApi('/auth' + uri);
        }
    );
    const Main = assignComponentToRoute('/studies', () => (
        <MainView applicationState={applicationState} />
    ));
    return (
        <div className={classes.root}>
            <CssBaseline />
            <Login />
            <LoginWithEmail />
            <SignUp />
            <Reset />
            <Main />
            <About />
            <Privacy />
            <Terms />
            <ResetPassword />
            <ErrorDisplay snackBar={snackBar} />
        </div>
    );
});

// @ts-ignore
export default withStyles(styles)(MainWrapper);
