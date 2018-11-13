import React, { Fragment } from 'react';
import { toJS } from 'mobx';
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
import applicationState, { saveNewStudy, updateStudy } from '../stores/applicationState';
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

async function update() {
    await updateStudy(applicationState.currentStudy);
    uiState.currentStudyIsNew = false;
}

async function create() {
    await saveNewStudy(applicationState.currentStudy)
    uiState.login = false;
}

const CreateOrUpdateButton = withStyles(styles)(({ studyId, classes }) => {
    const study = applicationState.studies[studyId];
    if (uiState.currentStudyIsNew) {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={create}>
                Create
            </Button>
        )
    } else {
        return (
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={update}>
                Update
            </Button>
        )
    }
})

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
        return (
            <Fragment>
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
                <Iframe url={`${process.env.server_hostname}/digitalShadow`}
                    width="450px"
                    height="450px"
                    id="myId"
                    className="myClassname"
                    display="initial"
                    position="relative"
                    allowFullScreen />
                <SurveyView surveys={Object.values(toJS(surveys))} />
                <CreateOrUpdateButton studyId={studyId} />
            </Fragment>
        );
    }
    return null;
});

export default withStyles(styles)(StudyView);
