import React from 'react';
import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { observer } from 'mobx-react';

import LoginView from './LoginView';
import MainView from './Main';
import SignUpView from './SignUpView';

import applicationState, { ApplicationState } from '../stores/applicationState';
import { Router, addRoute } from '../stores/router';

const drawerWidth = 240;

interface MainProps {
    router: Router;
    applicationState: ApplicationState;
}

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column'
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

const BASE_URL_MATCH = /^\/([^\/]*).*$/;

const MainWrapper = observer(
    (props: MainProps & WithStyles) => {
        const { classes, router } = props;
        const { uri } = router;
        const SignUp = addRoute('/signup', SignUpView);
        const Login = addRoute('/login', LoginView);
        // TSC needs a more specific type than () => Element, but that's the definition of a React.Component, so silence typescript manually
        // https://tylermcginnis.com/react-elements-vs-react-components/
        // @ts-ignore
        const Main = addRoute(() => BASE_URL_MATCH.exec(uri)[0] === '/studies', () => <MainView applicationState={applicationState} />)

        return (
            <div className={classes.root}>
                <CssBaseline />
                <Login />
                <SignUp />
                <Main />
            </div>
        );
    });

// @ts-ignore
export default withStyles(styles)(MainWrapper);
