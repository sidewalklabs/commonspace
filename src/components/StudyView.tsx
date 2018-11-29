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
    uiState.currentStudyIsNew = false;
}

async function create(study) {
    await saveNewStudy(study);
    uiState.mode = AuthMode.Authorized;
}

interface CreateOrUpdateButtonProps {
    study: Study;
    map: FeatureCollection;
}
const CreateOrUpdateButton = withStyles(styles)((props: CreateOrUpdateButtonProps & WithStyles) => {
    const { study, classes } = props;
    if (uiState.currentStudyIsNew) {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={() => create(study)}>
                Create
            </Button >
        )
    } else {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={() => update(study)}>
                Update
            </Button>
        )
    }
});

interface StudyViewProps {
    study: Study;
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

    const { study, classes } = props;
    if (study) {
        const { title, surveys, studyId, surveyors, protocolVersion, map } = study;
        const features = map && map.features ? map.features : [];
        const protocolVersionUpdate = (versionValue: string) => {

        }
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
                <CreateOrUpdateButton study={study} />
            </Fragment>
        );
    }
    return null;
});

export default withStyles(styles)(StudyView);
