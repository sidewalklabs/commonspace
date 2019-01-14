import React, { Fragment } from 'react';
import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { observer } from 'mobx-react';

import FieldsList from './FieldsList';
import StudiesList from './StudiesList';
import StudyView from './StudyView';
import SurveyView from './SurveyView';
import SurveyorsView from './SurveyorsView';
import WrapInModal from './WrapInModal';
import uiState, { visualizeNewStudy, AvailableModals } from '../stores/ui';
import applicationState, { setCurrentStudyEmptySkeleton, ApplicationState, studyEmptySkeleton } from '../stores/applicationState';
import { observable } from 'mobx';
import { navigate } from '../stores/router';

interface MainProps {
    applicationState: ApplicationState;
    anchorElement: null | HTMLElement;
}

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column'
    },
    toolbar: {
        color: 'inherit'
    },
    appBar: {
        position: 'relative',
        display: 'flex',
        marginTop: 'auto'
    },
    title: {
        marginLeft: theme.spacing.unit * 2,
        flexGrow: 1
    }
});

function prepareNewStudy() {
    setCurrentStudyEmptySkeleton()
    visualizeNewStudy()
}

function handleLogOut() {
    mainState.anchorElement = null;
    navigate('/login');
}

interface MainState {
    anchorElement: HTMLElement | null;
}

const mainState: MainState = observable({
    anchorElement: null
})

const Main = observer(
    (props: MainProps & WithStyles) => {
        const { applicationState, classes } = props;
        const { anchorElement } = mainState;
        const { studies, token } = applicationState;
        const { snackBar, visibleModal } = uiState;
        const currentStudy = applicationState.currentStudy ? applicationState.currentStudy : studyEmptySkeleton();
        let { fields, studyId, surveyors, type } = currentStudy;
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
                            onClick={e => mainState.anchorElement = e.currentTarget}
                            className={classes.menuIcon}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorElement}
                            open={Boolean(anchorElement)}
                            onClose={() => mainState.anchorElement = null}
                        >
                            <MenuItem onClick={() => mainState.anchorElement = null}>Profile</MenuItem>
                            <MenuItem onClick={() => mainState.anchorElement = null}>My account</MenuItem>
                            <MenuItem onClick={handleLogOut}>Logout</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div>
                    <Typography
                        component="h1"
                        variant="title"
                        color="inherit"
                        noWrap
                        className={classes.title}
                    >
                        All Studies
                    </Typography>
                    <Button color="primary" variant="contained" onClick={prepareNewStudy}>
                        New study
                    </Button>
                    <Paper>
                        <List>
                            <StudiesList studies={studies} />
                        </List>
                    </Paper>
                    <WrapInModal modalName={'study'} visibleModal={visibleModal}>
                        <StudyView study={currentStudy} studyIsNew={uiState.currentStudyIsNew} />
                    </WrapInModal>
                    <WrapInModal onClose={() => uiState.visibleModal = 'study'} modalName={'surveyors'} visibleModal={visibleModal}>
                        <SurveyorsView studyId={currentStudy.studyId} surveyors={currentStudy.surveyors} />
                    </WrapInModal>
                    <WrapInModal onClose={() => uiState.visibleModal = 'study'} modalName={'surveys'} visibleModal={visibleModal}>
                        <SurveyView surveys={Object.values(currentStudy.surveys)} features={currentStudy.map.features} />
                    </WrapInModal>
                    <WrapInModal onClose={() => uiState.visibleModal = 'study'} modalName={'studyFields'} visibleModal={visibleModal}>
                        <FieldsList studyType={type} fields={fields} />
                    </WrapInModal>
                </div>
            </div >
        )
    }
);

// @ts-ignore
export default withStyles(styles)(Main);
