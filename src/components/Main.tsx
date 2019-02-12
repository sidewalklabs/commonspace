import React, { Fragment } from 'react';
import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { observer } from 'mobx-react';

import FieldsList from './FieldsList';
import MapView from './MapView';
import StudiesList from './StudiesList';
import StudyView from './StudyView';
import SurveyView from './SurveyView';
import SurveyorsView from './SurveyorsView';
import WrapInModal from './WrapInModal';
import uiState from '../stores/ui';
import applicationState, { setCurrentStudyEmptySkeleton, getMapCenterForStudy, ApplicationState, studyEmptySkeleton } from '../stores/applicationState';
import { observable } from 'mobx';
import { navigate } from '../stores/router';
import { getFromApi, postToApi } from '../utils';

interface MainProps {
    applicationState: ApplicationState;
    anchorElement: null | HTMLElement;
}

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    toolbar: {
        color: 'inherit',
        backgroundColor: 'white'
    },
    appBar: {
        position: 'relative',
        display: 'flex',
        marginTop: 'auto'
    },
    mainBody: {
        width: '80%',
        minWidth: '300px',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '25px',
        marginBottom: '15px',
        width: '100%'
    },
    studiesList: {
        width: '100%'
    },
    title: {
        marginLeft: theme.spacing.unit,
        flexGrow: 1
    }
});

function prepareNewStudy() {
    const newStudy = studyEmptySkeleton();
    uiState.currentStudyIsNew = true;
    applicationState.currentStudy = newStudy;
    uiState.modalStack.push('study');
}

async function handleLogOut() {
    await postToApi('/auth/logout', {}) as {};
    mainState.anchorElement = null;
    navigate('/welcome');
}

function handleResetPassword() {
    // TODO: make sure this really logs you out
    mainState.anchorElement = null;
    navigate('/reset');
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
        const { snackBar, modalStack } = uiState;
        const currentStudy = applicationState.currentStudy ? applicationState.currentStudy : studyEmptySkeleton();
        let { fields, studyId, surveyors, map, type } = currentStudy;
        const allowedMapShapes = type === 'stationary' ? 'polygon' : 'line';
        const { latitude, longitude } = getMapCenterForStudy(studyId);
        const visibleModal = modalStack.slice(-1)[0]

        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar
                    className={classes.appBar}
                    color="default"
                >
                    <Toolbar className={classes.toolbar}>
                        <Avatar alt="Commons Icon" src="/assets/images/CircleIcon.png" className={classes.avatar} />
                        <Typography
                            component="h1"
                            variant="title"
                            color="inherit"
                            noWrap
                            className={classes.title}
                        >
                            CommonSpace
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
                            <MenuItem onClick={handleResetPassword}>Reset Password</MenuItem>
                            <MenuItem onClick={handleLogOut}>Logout</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div className={classes.mainBody}>
                    <div className={classes.row}>
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
                    </div>
                    <div className={classes.studiesList}>
                        <StudiesList studies={studies} />
                    </div>
                    <WrapInModal modalName={'study'} visibleModal={visibleModal}>
                        <StudyView study={currentStudy} studyIsNew={uiState.currentStudyIsNew} />
                    </WrapInModal>
                    <WrapInModal modalName={'surveyors'} visibleModal={visibleModal}>
                        <SurveyorsView studyId={currentStudy.studyId} surveyors={currentStudy.surveyors} />
                    </WrapInModal>
                    <WrapInModal modalName={'surveys'} visibleModal={visibleModal}>
                        <SurveyView surveys={Object.values(currentStudy.surveys)} features={currentStudy.map.features} />
                    </WrapInModal>
                    <WrapInModal modalName={'studyFields'} visibleModal={visibleModal}>
                        <FieldsList studyType={type} fields={fields} />
                    </WrapInModal>
                    <WrapInModal modalName={'map'} visibleModal={visibleModal}>
                        <MapView study={currentStudy} allowedShapes={allowedMapShapes} lat={latitude} lng={longitude} featureCollection={map} />
                    </WrapInModal>
                </div>
            </div >
        )
    }
);

// @ts-ignore
export default withStyles(styles)(Main);
