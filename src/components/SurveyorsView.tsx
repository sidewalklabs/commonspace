import React from 'react';
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

const TextTableCell = (props: TextTableCellProps & WithStyles) => {
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
}

interface SurveyorsViewProps {
    addNewSurveyorToSt
    addNewCell: (...args: any[]) => void;
    tableHeaders: string[] | any[];
    tableRows: React.Component[];
}

const Row = withStyles(styles)(observer(props => {
    const { email, classes } = props;
    return (
        <TableRow>
            <TableCell component="th" scope="row" />
            <TableCell component="th" scope="row">
                <TextField
                    className={classes.textField}
                    value={email}
                    margin="normal"
                />
            </TableCell>
        </TableRow>
    )
}))

export interface SurveryorsViewProps {
    studyId: string;
}

function handleAddingNewSurveyor() {

}

// todo, this is using the store components/ui.ts which may not be the best abstraction, this might be more localizable ...
const SurveyorsView = observer((props: SurveyorsViewProps & WithStyles) => {
    const { classes, studyId } = props;
    const userEnteredEmail = uiState.addSurveyorModalText;
    const surveyors = applicationState.currentStudy ? applicationState.currentStudy.surveyors : [];
    const tableRows = surveyors.map(email => <Row email={email} />);
    return (
        <div>
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => uiState.addSurveyorModalIsOpen = true}>Add</TableCell>
                            <TableCell>Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{tableRows}</TableBody>
                </Table>
            </Paper >
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={uiState.addSurveyorModalIsOpen}
                onClose={() => uiState.addSurveyorModalIsOpen = false}
            >
                <div className={classes.modal}>
                    <Typography variant="h6" id="modal-title">
                        Enter an email to give access to your study
                    </Typography>
                    <TextField
                        id="email-surveyor-add-text"
                        label="email"
                        className={classes.textField}
                        value={userEnteredEmail}
                        onChange={e => uiState.addSurveyorModalText = e.target.value}
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={() => addNewSurveyorToSurvey(studyId, userEnteredEmail)}>
                        Add Surveyor
                    </Button>
                </div>
            </Modal>
        </div>
    )
})

export default withStyles(styles)(SurveyorsView);
