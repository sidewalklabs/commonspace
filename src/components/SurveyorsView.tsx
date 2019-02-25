import React, { ChangeEvent } from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { observer } from 'mobx-react';

import applicationState, { addNewSurveyorToSurvey } from '../stores/applicationState';
import { closeModalIfVisible } from '../stores/ui';

const styles = theme => ({
    header: {
        padding: theme.spacing.unit * 3
    },
    body: {
        overflow: 'auto'
    },
    footer: {
        display: 'flex',
        padding: theme.spacing.unit * 3,
        justifyContent: 'flex-end'
    },
    form: {
        display: 'flex',
        alignItems: 'center'
    },
    textField: {
        marginRight: theme.spacing.unit * 2
    }
});

function handleAddingNewSurveyor(studyId, email) {
    // TODO: add validation for email and whitspace stripping, etc.
    if (email) {
        const trimmedEmail = email.trim();
        if (trimmedEmail.length) {
            addNewSurveyorToSurvey(studyId, trimmedEmail);
            applicationState.draftSurveyor = '';
        }
    }
}

interface SurveyorsViewProps {
    studyId: string;
    surveyors: string[];
}

// todo, this is using the store components/ui.ts which may not be the best abstraction, this might be more localizable ...
const SurveyorsView = observer((props: SurveyorsViewProps & WithStyles) => {
    const { classes, studyId, surveyors } = props;

    const canAddEmail =
        applicationState.draftSurveyor && applicationState.draftSurveyor.trim().length;

    return (
        <>
            <div className={classes.header}>
                <Typography component="h2" variant="h6" color="inherit" gutterBottom noWrap>
                    Add Surveyors
                </Typography>
            </div>
            <div className={classes.body}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {surveyors.map((email, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {email}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell component="th" scope="row">
                                <div className={classes.form}>
                                    <TextField
                                        className={classes.textField}
                                        autoFocus
                                        placeholder="Enter an email"
                                        value={applicationState.draftSurveyor}
                                        onChange={e =>
                                            (applicationState.draftSurveyor = e.target.value)
                                        }
                                        onKeyPress={e => {
                                            if (e.key === 'Enter') {
                                                handleAddingNewSurveyor(
                                                    studyId,
                                                    applicationState.draftSurveyor
                                                );
                                            }
                                        }}
                                        margin="normal"
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={!canAddEmail}
                                        onClick={e =>
                                            handleAddingNewSurveyor(
                                                studyId,
                                                applicationState.draftSurveyor
                                            )
                                        }
                                    >
                                        Add Surveyor
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div className={classes.footer}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => closeModalIfVisible('surveyors')}
                >
                    Return to Study
                </Button>
            </div>
        </>
    );
});

// @ts-ignore
export default withStyles(styles)(SurveyorsView);
