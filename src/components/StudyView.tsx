import React, { Fragment } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import SurveyorsView from './SurveyorsView';
import MapView from './MapView';
import SurveyView from './SurveyView';

import uiState from '../stores/ui';
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
    uiState.visibleModal = null;
}

async function create(study) {
    await saveNewStudy(study);
    uiState.currentStudyIsNew = false;
    uiState.visibleModal = null;
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
            <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={async () => await updateStudy(study)}>
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
    const STUDY_TYPES = [
        {
            value: 'stationary',
            label: 'Stationary Activity Count'
        },
        {
            value: 'movement',
            label: 'Movement Counts'
        }
    ];

    const PROTOCOL_SELECTIONS = [
        {
            value: '1.0',
            label: 'latest'
        }
    ]

    const { study, classes, studyIsNew } = props;
    if (study) {
        const { title, surveys, studyId, fields, surveyors, protocolVersion, type, map } = study as Study;
        const features = map && map.features ? map.features : [];
        const allowedMapShapes = type === 'stationary' ? 'polygon' : 'line';
        const StudyTypeField = props => studyIsNew ?
            (<TextField
                select
                label="Study Type"
                className={classes.textField}
                value={groupArrayOfObjectsBy(STUDY_TYPES, 'value')[type].value}
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
                    return <MenuItem key={label} value={value}>
                        {label}
                    </MenuItem>
                })}
            </TextField>) : (<TextField
                label="Study Type"
                className={classes.textField}
                value={groupArrayOfObjectsBy(STUDY_TYPES, 'value')[type].label}
                margin="normal"
                InputProps={{
                    readOnly: true
                }}
            />)

        return (
            <Fragment>
                <TextField
                    label="Title"
                    className={classes.textField}
                    value={title}
                    onChange={e => study.title = e.target.value}
                    margin="normal"
                />

                <StudyTypeField />
                <TextField
                    className={classes.textField}
                    label="Study Fields"
                    value={`${fields.length} Fields`}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="end" onClick={() => uiState.visibleModal = "studyFields"}>
                                <EditIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    className={classes.textField}
                    label="Surveyors"
                    value={`${surveyors.length} Surveyors`}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="end" onClick={() => uiState.visibleModal = "surveyors"}>
                                <EditIcon />
                            </InputAdornment>
                        ),
                    }}
                >

                </TextField>
                <TextField
                    className={classes.textField}
                    label="Surveys"
                    value={`${Object.keys(toJS(surveys)).length} Surveys`}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="end" onClick={() => uiState.visibleModal = "surveys"}>
                                <EditIcon />
                            </InputAdornment>
                        ),
                    }}
                >
                </TextField>
                {/* <TextField
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
                 
                    return (<MenuItem key={value} value={value}>
                    {label}
                    </MenuItem>)
                    })}
                    </TextField> */}
                <MapView allowedShapes={allowedMapShapes} lat={33.546727} lng={-117.673965} featureCollection={map} />
                <CreateOrUpdateButton study={study} studyIsNew={studyIsNew} />
            </Fragment>
        );
    }
    return null;
});

// @ts-ignore
export default withStyles(styles)(StudyView);
