import React, { Fragment } from 'react';
import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { observer } from 'mobx-react';

import LoginView from './LoginView';
import Main from './Main';
import SignUpView from './SignUpView';

import uiState, { AuthMode } from '../stores/ui';
import applicationState, { ApplicationState } from '../stores/applicationState';
import { Router } from '../stores/router';

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

const baseUrlMatch = /^\/([^\/]*).*$/;

function body(baseRoute) {
    switch (baseRoute) {
        case '/signup':
            return <SignUpView />;
        case '/login':
            console.log('boo');
            return <LoginView />;
        case '/studies':
            return <Main applicationState={applicationState} />;
        default:
            return null;
    }
}

const MainWrapper = observer(
    (props: MainProps & WithStyles) => {
        const { classes, router } = props;
        const { uri } = router;
        const { currentStudy } = applicationState;
        const baseRoute = baseUrlMatch.exec(uri)[0];
        return (
            <div className={classes.root}>
                <CssBaseline />
                {body(baseRoute)}
            </div>
        );
    });

// @ts-ignore
export default withStyles(styles)(MainWrapper);
