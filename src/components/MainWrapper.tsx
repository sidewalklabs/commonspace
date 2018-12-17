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

const drawerWidth = 240;

interface MainProps {
    isOpen: boolean;
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

const MainWrapper = observer(
    (props: MainProps & WithStyles) => {
        const { classes } = props;
        const { currentStudy, token } = applicationState;
        console.log(token);
        return (
            <div className={classes.root}>
                <CssBaseline />
                {
                    token ?
                        <Main applicationState={applicationState} />
                        :
                        uiState.mode === AuthMode.Login ?
                            <LoginView /> :
                            <SignUpView />
                }
            </div>
        )
    }
);

// @ts-ignore
export default withStyles(styles)(MainWrapper);
