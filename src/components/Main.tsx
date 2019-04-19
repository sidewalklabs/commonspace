import React from 'react';
import { observer } from 'mobx-react';

import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import AppBar from './AppBar';
import DeleteStudy from './DeleteStudy';
import FieldsList from './FieldsList';
import MapView from './MapView';
import StudiesList from './StudiesList';
import StudyView from './StudyView';
import SurveyView from './SurveyView';
import SurveyorsView from './SurveyorsView';
import WrapInModal from './WrapInModal';
import uiState from '../stores/ui';
import applicationState, {
    getMapCenterForStudy,
    ApplicationState,
    studyEmptySkeleton
} from '../stores/applicationState';

interface MainProps {
    applicationState: ApplicationState;
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
    mainBody: {
        width: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit *
            3}px`,
        [theme.breakpoints.up('md')]: {
            width: theme.breakpoints.values.md
        }
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 2,
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

const Main = observer((props: MainProps & WithStyles) => {
    const { applicationState, classes } = props;
    const { studies } = applicationState;
    const { modalStack } = uiState;
    const currentStudy = applicationState.currentStudy
        ? applicationState.currentStudy
        : studyEmptySkeleton();
    let { fields, studyId, surveys, surveyors, map, type } = currentStudy;
    const allowedMapShapes = type === 'stationary' ? 'polygon' : 'line';
    const { latitude, longitude } = getMapCenterForStudy(studyId);
    const visibleModal = modalStack.slice(-1)[0];

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar rightHeaderType="account-menu" />
            <div className={classes.mainBody}>
                <div className={classes.row}>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        gutterBottom
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
                <WrapInModal modalName={'deleteStudy'} visibleModal={visibleModal}>
                    <DeleteStudy study={currentStudy} />
                </WrapInModal>
                <WrapInModal modalName={'surveyors'} visibleModal={visibleModal}>
                    <SurveyorsView studyId={studyId} surveyors={surveyors} />
                </WrapInModal>
                <WrapInModal modalName={'surveys'} visibleModal={visibleModal}>
                    <SurveyView surveys={Object.values(surveys)} features={map.features} />
                </WrapInModal>
                <WrapInModal modalName={'studyFields'} visibleModal={visibleModal}>
                    <FieldsList studyType={type} fields={fields} />
                </WrapInModal>
                <WrapInModal modalName={'map'} visibleModal={visibleModal}>
                    <MapView
                        study={currentStudy}
                        allowedShapes={allowedMapShapes}
                        lat={latitude}
                        lng={longitude}
                        featureCollection={map}
                    />
                </WrapInModal>
            </div>
        </div>
    );
});

// @ts-ignore
export default withStyles(styles)(Main);
