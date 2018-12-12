import React, { Fragment } from 'react';
import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/Icon';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';

import { observer } from 'mobx-react';

import LoginView from './LoginView';
import SignUpView from './SignUpView';
import StudiesList from './StudiesList';
import StudyView from './StudyView';
import mapState from '../stores/map';
import uiState, { visualizeNewStudy, AuthMode } from '../stores/ui';
import applicationState, { setCurrentStudyEmptySkeleton, ApplicationState } from '../stores/applicationState';

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

function prepareNewStudy() {
    setCurrentStudyEmptySkeleton()
    visualizeNewStudy()
}

const Main = observer(
    (props: MainProps & WithStyles) => {
        const { drawerOpen } = uiState;
        const { applicationState, classes } = props;
        const { currentStudy, token } = applicationState;
        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar
                    className={classes.appBar}
                    color="default"
                >
                    <Toolbar className={classes.toolbar}>
                        <Avatar alt="Commons Icon" src="/assests/images/CircleIcon.png" className={classes.avatar} />
                        <Typography
                            component="h1"
                            variant="title"
                            color="inherit"
                            noWrap
                            className={classes.title}
                        >
                            Commons
                        </Typography>
                        <IconButton
                            color="inherit"
                            aria-label="Open Menu"
                            onClick={() => (uiState.drawerOpen = true)}
                            className={classes.menuIcon}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                {
                    token ?
                        null
                        :
                        uiState.mode === AuthMode.Login ?
                            <LoginView /> :
                            <SignUpView />

                }
                {/* <Drawer
                variant="permanent"
                classes={{
                paper: classNames(
                classes.drawerPaper,
                !drawerOpen && classes.drawerPaperClose
                )
                }}
                open={drawerOpen}
                >
                <div className={classes.toolbarIcon}>
                <IconButton onClick={() => (uiState.drawerOpen = false)}>
                <ChevronLeftIcon />
                </IconButton>
                </div>
                <Divider />
                <List>
                <StudiesList />
                </List>
                <Icon className={classes.icon} color="primary" fontSize="large" onClick={() => prepareNewStudy()}>
                add_circle
                </Icon>
                </Drawer>
                <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <StudyView study={currentStudy} studyIsNew={uiState.currentStudyIsNew} />
                </main> */}
            </div>
        )
    }
);

// @ts-ignore
export default withStyles(styles)(Main);
