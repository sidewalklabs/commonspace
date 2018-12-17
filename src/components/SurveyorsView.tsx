import React, { ChangeEvent } from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { observer } from 'mobx-react';

import applicationState, { addNewSurveyorToSurvey } from '../stores/applicationState';
import uiState from '../stores/ui';

const styles = theme => ({
    smallColumn: {
        width: 'auto',
        whiteSpace: 'nowrap'
    },
    column: {
        width: '100%'
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap'
    },
    root: {
        width: '80%',
        height: '40%',
        marginTop: theme.spacing.unit * 3,
        overflow: 'auto'
    },
    rightCornerButton: {
        margin: theme.spacing.unit,
        alignContent: 'flex-end',
        width: 150
    },
    modal: {
        top: '50%',
        left: '50%',
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200
    }
})

export interface TextTableCellProps {
    displayText: string;
    onUpdate: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => void;
}

// @ts-ignore
const TextTableCell = withStyles(styles)((props: TextTableCellProps & WithStyles) => {
    const { classes, displayText, onUpdate } = props;
    return (
        <TableCell numeric>
            <TextField
                id="survey-title"
                label="Title"
                className={classes.textField}
                value={displayText}
                onChange={e => onUpdate(e)}
                margin="normal"
            />
        </TableCell>
    )
})

interface SurveyorsViewProps {
    addNewCell: (...args: any[]) => void;
    tableHeaders: string[] | any[];
    tableRows: React.Component[];
}

// @ts-ignore
const Row = withStyles(styles)(observer(props => {
    const { email, classes, index } = props;
    return (
        <TableRow key={index}>
            <TableCell className={classes.column} component="th" scope="row">
                <TextField
                    placeholder="Enter an email"
                    className={classes.textField}
                    value={email}
                    onChange={e => applicationState.currentStudy.surveyors[index] = e.target.value}
                    margin="normal"
                />
            </TableCell>
        </TableRow>
    )
}))

function handleAddingNewSurveyor(studyId, email) {
    applicationState.currentStudy.surveyors.push('');
    addNewSurveyorToSurvey(studyId, email);
}

interface SurveyorsViewProps {
    studyId: string;
    surveyors: string[];
}

// todo, this is using the store components/ui.ts which may not be the best abstraction, this might be more localizable ...
const SurveyorsView = observer((props: SurveyorsViewProps & WithStyles) => {
    const { classes, surveyors } = props;

    const addNewEmptySurveyorToStudy = () => {
        applicationState.currentStudy.surveyors = [...surveyors, ''];
    }
    const tableRows = surveyors.map((email, index) => <Row email={email} index={index} />);
    return (
        <div>
            <Paper className={classes.root}>
                Add Surveyors
                <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={addNewEmptySurveyorToStudy}>
                    Add Surveyor
                    </Button>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.column}>Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{tableRows}</TableBody>
                </Table>
            </Paper >
        </div >
    )
})

// @ts-ignore
export default withStyles(styles)(SurveyorsView);
