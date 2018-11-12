import React, { Fragment } from 'react';
import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Icon from '@material-ui/core/Icon';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';

import { observer } from 'mobx-react';

import LoginView from './LoginView';
import SignUpView from './SignUpView';
import StudiesList from './StudiesList';
import StudyView from './StudyView';
import uiState, { visualizeNewStudy, AuthMode } from '../stores/ui';
import applicationState, { setCurrentStudyEmptySkeleton } from '../stores/applicationState';

const drawerWidth = 240;

interface MainProps {
    isOpen: boolean;
}

const styles = theme => ({
    root: {
        display: 'flex'
    },
    toolbar: {
        paddingRight: 24 // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36
    },
    menuButtonHidden: {
        display: 'none'
    },
    title: {
        flexGrow: 1
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        }),
        display: 'flex',
        flexDirection: 'column'
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9
        }
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        height: '100vh',
        overflow: 'auto'
    },
    icon: {
        margin: theme.spacing.unit * 2,
        marginTop: 'auto'
    }
});

function prepareNewStudy() {
    setCurrentStudyEmptySkeleton()
    visualizeNewStudy()
}

const Main: (props: MainProps & WithStyles) => React.Component = observer(
    (props: MainProps & WithStyle) => {
        const { drawerOpen } = uiState;
        const { token } = applicationState;
        const { classes } = props;
        if (token) {
            return (
                <Fragment>
                    <CssBaseline />
                    <div className={classes.root}>
                        <AppBar
                            position="absolute"
                            className={classNames(
                                classes.appBar,
                                drawerOpen && classes.appBarShift
                            )}
                        >
                            <Toolbar disableGutters={!drawerOpen} className={classes.toolbar}>
                                <IconButton
                                    color="inherit"
                                    aria-label="Open drawer"
                                    onClick={() => (uiState.drawerOpen = true)}
                                    className={classNames(
                                        classes.menuButton,
                                        drawerOpen && classes.menuButtonHidden
                                    )}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Typography
                                    component="h1"
                                    variant="title"
                                    color="inherit"
                                    noWrap
                                    className={classes.title}
                                >
                                    Commons
                            </Typography>
                            </Toolbar>
                        </AppBar>
                        <Drawer
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
                            <StudyView />
                        </main>
                    </div>
                </Fragment>
            )
        } else {
            return (
                <div className={classes.root}>
                    <CssBaseline />
                    <div className={classes.root}>
                        {uiState.mode === AuthMode.Login ?
                            <LoginView /> :
                            <SignUpView />
                        }
                    </div>
                </div>
            )
        }
    }
);

export default withStyles(styles)(Main);
