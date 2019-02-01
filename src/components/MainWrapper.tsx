import React from 'react';
import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { observer } from 'mobx-react';
import parse from 'url-parse';

import ErrorDisplay from './ErrorDisplay';
import LoginView from './LoginView';
import MainView from './Main';
import ResetView from './ResetView';
import ResetPasswordView from './ResetPasswordView';
import SignUpView from './SignUpView';

import applicationState, { ApplicationState } from '../stores/applicationState';
import { UiState } from '../stores/ui';
import { Router, addRoute } from '../stores/router';

const drawerWidth = 240;

interface MainProps {
    router: Router;
    applicationState: ApplicationState;
    uiState: UiState;
}

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    toolbar: {
        color: 'inherit'
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar
    },
    appBar: {
        position: 'relative',
        display: 'flex',
        marginTop: 'auto'
    },
    icon: {
        marginRight: theme.spacing.unit * 2,
    },
    title: {
        marginLeft: theme.spacing.unit * 2,
        flexGrow: 1
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        height: '100vh',
        overflow: 'auto'
    }
});

function queryParamsParse(queryString: string) {
    const asArr = queryString.substr(1).split('&');
    // put them into a dictionary
    return asArr.reduce((acc, s) => {
        const [key, value] = s.split('=');
        const next = {}
        next[key] = value;
        return {
            ...acc,
            ...next
        }
    }, {});
}

const BASE_URL_MATCH = /^\/([^\/]*).*$/;

const MainWrapper = observer(
    (props: MainProps & WithStyles) => {
        const { classes, router, uiState } = props;
        const { uri } = router;
        const { snackBar } = uiState;
        const SignUp = addRoute('/signup', SignUpView);
        const Login = addRoute('/login', LoginView);
        const Reset = addRoute('/reset', ResetView);
        const ResetPassword = addRoute(
            () => {
                const { pathname } = parse(uri);
                return pathname === '/reset_password'
            },
            () => {
                const { query } = parse(uri);
                // @ts-ignore
                const { token } = queryParamsParse(query);
                return <ResetPasswordView token={token} />
            }
        );
        const Main = addRoute(() => BASE_URL_MATCH.exec(uri)[0] === '/studies', () => <MainView applicationState={applicationState} />)
        return (
            <div className={classes.root}>
                <CssBaseline />
                <Login />
                <SignUp />
                <Reset />
                <Main />
                <ResetPassword />
                <ErrorDisplay snackBar={snackBar} />
            </div>
        );
    });

// @ts-ignore
export default withStyles(styles)(MainWrapper);
