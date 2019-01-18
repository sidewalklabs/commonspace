import React, { Fragment } from 'react';
import { toJS } from 'mobx';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import { observer } from 'mobx-react';

import { deleteStudy, selectNewStudy, Study } from '../stores/applicationState';
import LockedMapView from './LockedMapView';
import uiState from '../stores/ui';

const styles = theme => ({
    icon: {
        margin: theme.spacing.unit * 2,
    }
});

async function transitionToViewStudy(study) {
    uiState.currentStudyIsNew = false;
    await selectNewStudy(study);
    uiState.visibleModal = 'study';
}

async function removeStudy(studyId: string) {
    await deleteStudy(studyId);
}

export interface StudiesListProps {
    studies: { [key: string]: Study };
}

const ExpandedStudy = withStyles(styles)((props: WithStyles & { study: Study }) => {
    const { classes, study } = props;
    const { title, fields, surveyors, location, surveys = {}, map } = study;
    const { studyId } = study;
    return (
        <Fragment>
            <TextField
                label="Title"
                className={classes.textField}
                value={title}
                margin="normal"
            />
            <TextField
                className={classes.textField}
                label="Study Fields"
                value={`${fields.length} Fields`}
                margin="normal"
            />
            <TextField
                className={classes.textField}
                label="Surveyors"
                value={`${surveyors.length} Surveyors`}
                margin="normal"
            >
            </TextField>
            <TextField
                className={classes.textField}
                label="Surveys"
                value={`${Object.keys(toJS(surveys)).length} Surveys`}
                margin="normal"
            >
            </TextField>
            <TextField
                className={classes.textField}
                label="Location"
                value={location}
                margin="normal"
            >
            </TextField>
            <LockedMapView lat={33.546727} lng={-117.673965} featureCollection={map} />
            <Button variant="contained" color="secondary" onClick={async () => await removeStudy(studyId)}>
                Delete
            </Button>
            <Button variant="contained" color="primary" onClick={async () => await transitionToViewStudy(study)}>
                Edit
            </Button>
        </Fragment >
    )

});

export default withStyles(styles)(observer((props: StudiesListProps & WithStyles) => {
    const { classes, studies } = props;
    const studiesAsRows = Object.values(studies).map((study, index) => {
        const { studyId, title } = study;
        return (
            <ExpansionPanel key={studyId}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell onClick={async () => await transitionToViewStudy(study)}>{title}</TableCell>
                                <TableCell>Oct 20, 2018</TableCell>
                                <TableCell>Nov 20, 2018</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <ExpandedStudy study={study} />
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    });
    return (
        <Fragment>
            {studiesAsRows}
        </Fragment>
    )
}));
