import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import LockedMapView from './LockedMapView';

import uiState, { closeModalIfVisible } from '../stores/ui';
import applicationState, {
    saveNewStudy,
    updateStudy,
    Study,
    getMapCenterForStudy
} from '../stores/applicationState';
import { groupArrayOfObjectsBy } from '../utils';
import { FeatureCollection } from 'geojson';

const styles = theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    header: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 2
    },
    footer: {
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        marginTop: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 3,
        justifyContent: 'flex-end'
    },
    columns: {
        display: 'flex'
    },
    column: {
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    rightCornerButton: {
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
    closeModalIfVisible('study');
}

async function create(study) {
    await saveNewStudy(study);
    uiState.currentStudyIsNew = false;
    closeModalIfVisible('study');
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
            <Button
                variant="contained"
                color="primary"
                className={classes.rightCornerButton}
                onClick={async () => await create(study)}
            >
                Create
            </Button>
        );
    } else {
        return (
            <Button
                variant="contained"
                color="primary"
                className={classes.rightCornerButton}
                onClick={async () => await update(study)}
            >
                Update
            </Button>
        );
    }
});

interface LocationTextFieldProps {
    location: string;
    editable: boolean;
}

// @ts-ignore
const LocationTextField = withStyles(styles)(
    observer((props: LocationTextFieldProps & WithStyles) => {
        const { editable, location, classes } = props;
        if (editable) {
            return (
                <TextField
                    className={classes.textField}
                    label="Location"
                    value={location}
                    onChange={e => (applicationState.currentStudy.location = e.target.value)}
                />
            );
        } else {
            return <TextField className={classes.textField} label="Location" value={location} />;
        }
    })
);

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
    ];

    const { study, classes, studyIsNew } = props;
    if (study) {
        const {
            title,
            author,
            authorUrl,
            description,
            location,
            surveys = {},
            studyId,
            fields,
            surveyors,
            protocolVersion,
            type,
            map
        } = study as Study;
        const { latitude, longitude } = getMapCenterForStudy(studyId);
        const features = map && map.features ? map.features : [];
        const StudyTypeField = props =>
            studyIsNew ? (
                <TextField
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
                        return (
                            <MenuItem key={label} value={value}>
                                {label}
                            </MenuItem>
                        );
                    })}
                </TextField>
            ) : (
                <TextField
                    label="Study Type"
                    disabled
                    className={classes.textField}
                    value={groupArrayOfObjectsBy(STUDY_TYPES, 'value')[type].label}
                    margin="normal"
                    InputProps={{
                        readOnly: true
                    }}
                />
            );

        return (
            <div className={classes.container}>
                {studyIsNew && (
                    <div className={classes.header}>
                        <Typography variant="h6">New Study</Typography>
                    </div>
                )}
                <div className={classes.columns}>
                    <div className={classes.column}>
                        <TextField
                            label="Title"
                            className={classes.textField}
                            value={title}
                            onChange={e => (study.title = e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            className={classes.textField}
                            label="Description"
                            value={description}
                            onChange={e =>
                                (applicationState.currentStudy.description = e.target.value)
                            }
                        />
                        <TextField
                            className={classes.textField}
                            label="Author"
                            value={author}
                            onChange={e => (applicationState.currentStudy.author = e.target.value)}
                        />
                        <TextField
                            className={classes.textField}
                            label="Author Url"
                            value={authorUrl}
                            onChange={e =>
                                (applicationState.currentStudy.authorUrl = e.target.value)
                            }
                        />
                        <StudyTypeField />
                        <TextField
                            className={classes.textField}
                            label="Study Fields"
                            disabled
                            value={`${fields.length} Fields`}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Edit Fields"
                                            onClick={() => uiState.modalStack.push('studyFields')}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            className={classes.textField}
                            label="Surveyors"
                            disabled
                            value={`${surveyors.length} Surveyors`}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Edit Surveyors"
                                            onClick={() => uiState.modalStack.push('surveyors')}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            className={classes.textField}
                            disabled
                            label="Surveys"
                            value={`${Object.keys(toJS(surveys)).length} Surveys`}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Edit Surveys"
                                            onClick={() => uiState.modalStack.push('surveys')}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                    <div className={classes.column}>
                        <LocationTextField location={location} editable={studyIsNew} />
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
                        <LockedMapView
                            isEditable
                            showOverlay={!features.length}
                            lat={latitude}
                            lng={longitude}
                            featureCollection={map}
                        />
                    </div>
                </div>
                <div className={classes.footer}>
                    <CreateOrUpdateButton study={study} studyIsNew={studyIsNew} />
                </div>
            </div>
        );
    }
    return null;
});

// @ts-ignore
export default withStyles(styles)(StudyView);
