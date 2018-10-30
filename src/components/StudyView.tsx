import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Iframe from 'react-iframe'

import SurveyorsView from './SurveyorsView';
import MapView from './MapView';
import SurveyView from './SurveyView';

import uiState from '../stores/ui';
import applicationState, { createStudy, updateStudy } from '../stores/applicationState';
import { groupArrayOfObjectsBy } from '../utils';


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

function saveOrUpdateStudy(study) {
    updateStudy(study);
    uiState.currentStudyIsNew = false;
}

const CreateOrUpdateButton = withStyles(styles)(({ studyId, classes } => {
    const study = applicationState.studies[studyId];
    if (uiState.currentStudyIsNew) {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={() => createStudy(applicationState.studies[studyId])}>
                Create
            </Button>
        )
    } else {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={() => updateStudy(applicationState.studies[studyId])}>
                Update
            </Button>
        )
    }
}))

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

    const { classes } = props;
    if (applicationState.currentStudy) {
        const { title, surveys, studyId, protocolVersion } = applicationState.currentStudy;
        const protocolVersionUpdate = (versionValue: string) => {

        }
        const saveButtonFn = uiState.currentStudyIsNew ?
            () => updateStudy(applicationState.studies[studyId])
            : () => createNewStudy(applicationState.currentStudy, surveyors)
        return (
            <Fragment id="study" className={classes.container}>
                <TextField
                    id="study-title"
                    label="Title"
                    className={classes.textField}
                    value={title}
                    onChange={e => applicationState.currentStudy.title = e.target.value}
                    margin="normal"
                />
                <TextField
                    id="select-protocol-version"
                    select
                    label="Gehl Protocol Version"
                    className={classes.textField}
                    value={groupArrayOfObjectsBy(PROTOCOL_SELECTIONS, 'value')[protocolVersion].label}
                    onChange={e => {
                        applicationState.currentStudy.protocolVersion = e.target.value;
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
                <SurveyorsView studyId={studyId} />
                <Iframe url="http://localhost:3000/digitalshadow"
                    width="450px"
                    height="450px"
                    id="myId"
                    className="myClassname"
                    display="initial"
                    position="relative"
                    allowFullScreen />
                <SurveyView surveys={surveys} />
                <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={() => updateStudy(applicationState.studies[studyId])}>
                    {uiState.currentStudyIsNew ? 'Create' : 'Update'}
                </Button>
            </Fragment>
        );
    }
    return null;
});

export default withStyles(styles)(StudyView);
