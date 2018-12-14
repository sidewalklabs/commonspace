import React, { Fragment } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import SurveyorsView from './SurveyorsView';
import MapView from './MapView';
import SurveyView from './SurveyView';

import uiState, { AuthMode } from '../stores/ui';
import applicationState, { saveNewStudy, updateStudy, Study } from '../stores/applicationState';
import { groupArrayOfObjectsBy } from '../utils';
import { FeatureCollection } from 'geojson';


const styles = theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200
    },
    rightCornerButton: {
        margin: theme.spacing.unit,
        alignContent: 'flex-end',
        width: 150
    },
    map: {
        width: '300px',
        height: '300px'
    }
});

async function update(study) {
    await updateStudy(study);
}

async function create(study) {
    await saveNewStudy(study);
    uiState.currentStudyIsNew = false;
}

interface CreateOrUpdateButtonProps {
    study: Study;
    map: FeatureCollection;
    studyIsNew: boolean;
}

// @ts-ignore
const CreateOrUpdateButton = withStyles(styles)((props: CreateOrUpdateButtonProps & WithStyles) => {
    const { studyIsNew, study, classes } = props;
    if (studyIsNew) {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={async () => await create(study)}>
                Create
            </Button >
        );
    } else {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={updateStudy}>
                Update
            </Button>
        );
    }
});

interface StudyViewProps {
    study: Study;
    studyIsNew: boolean;
}

const StudyView = observer((props: any & WithStyles) => {
    const PROTOCOL_SELECTIONS = [
        {
            value: 'beta',
            label: 'beta'
        },
        {
            value: '1.0',
            label: 'latest'
        },
        {
            value: '1.0',
            label: '1.0'
        }
    ];

    const STUDY_TYPES = [
        {
            value: 'activity',
            label: 'Stationary Activity Count'
        },
        {
            value: 'movement',
            label: 'Movement Counts'
        }
    ]

    const { study, classes, studyIsNew } = props;
    if (study) {
        console.log(study);
        const { title, surveys, studyId, surveyors, protocolVersion, type, map } = study as Study;
        const features = map && map.features ? map.features : [];
        return (
            <Fragment>
                <TextField
                    id="study-title"
                    label="Title"
                    className={classes.textField}
                    value={title}
                    onChange={e => study.title = e.target.value}
                    margin="normal"
                />
                <TextField
                    id="select-study-type"
                    select
                    label="Study Type"
                    className={classes.textField}
                    value={groupArrayOfObjectsBy(STUDY_TYPES, 'value')[type].label}
                    onChange={e => {
                        study.type = e.target.value;
                    }}
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu
                        }
                    }}
                    margin="normal"
                >
                    {STUDY_TYPES.map(({ value, label }) => {
                        return (<MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>)
                    })}
                </TextField>
                <TextField
                    id="select-protocol-version"
                    select
                    label="Gehl Protocol Version"
                    className={classes.textField}
                    value={groupArrayOfObjectsBy(PROTOCOL_SELECTIONS, 'value')[protocolVersion].label}
                    onChange={e => {
                        study.protocolVersion = e.target.value;
                    }}
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu
                        }
                    }}
                    margin="normal"
                >
                    {PROTOCOL_SELECTIONS.map(({ value, label }) => {
                        return (<MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>)
                    })}
                </TextField>
                <SurveyorsView studyId={studyId} surveyors={surveyors} />
                <MapView lat={33.546727} lng={-117.673965} featureCollection={map} />
                <SurveyView surveys={Object.values(toJS(surveys))} features={features} />
                <CreateOrUpdateButton study={study} studyIsNew={studyIsNew} />
            </Fragment>
        );
    }
    return null;
});

// @ts-ignore
export default withStyles(styles)(StudyView);
