import React from 'react';
import moment from 'moment';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';

import { get, set, toJS } from 'mobx';
import { observer } from 'mobx-react';

import applicationState from '../stores/applicationState';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    root: {
        width: '75%',
        height: '40%',
        marginTop: theme.spacing.unit * 3,
        overflow: 'auto'
    },
    table: {
        minWidth: 400,
        overflow: 'auto'
    },
    textfield: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 125
    }
});

function changeTime(originalDatetime, updatedTime) {
    const [hour, minute] = updatedTime.split(':');
    const startDate = moment(originalDatetime);
    startDate.hour(hour);
    startDate.minute(minute);
    return startDate.toISOString();
}

function changeDate(originalDatetime, updatedDate) {
    const newDate = moment(updatedDate);
    const startDate = moment(originalDatetime);
    startDate.year(newDate.year());
    startDate.month(newDate.month());
    startDate.date(newDate.date());
    return startDate.toISOString();
}

function changeStartTime(survey, updatedTime) {
    applicationState.currentStudy.surveys[survey.surveyId].startDate = changeTime(
        survey.startDate,
        updatedTime
    );
}

function changeStartDate(survey, updatedDate) {
    applicationState.currentStudy.surveys[survey.surveyId].startDate = changeDate(
        survey.startDate,
        updatedDate
    );
}

function changeEndTime(survey, updatedTime) {
    applicationState.currentStudy.surveys[survey.surveyId].endDate = changeTime(
        survey.endDate,
        updatedTime
    );
}

function changeEndDate(survey, updatedDate) {
    applicationState.currentStudy.surveys[survey.surveyId].endDate = changeDate(
        survey.endDate,
        updatedDate
    );
}

const SurveyObjectToTableRow = observer(({ classes, survey }) => {
    const startDate = moment(survey.startDate);
    const startDateDisplayDate = startDate.format('YYYY-MM-DD');
    const startTime = startDate.format('kk:mm');
    const endDate = moment(survey.endDate);
    const endDateDisplayDate = endDate.format('YYYY-MM-DD');
    const endTime = endDate.format('kk:mm');
    return (
        <TableRow key={survey.surveyId}>
            <TableCell component="th" scope="row">
                {survey.userEmail}
            </TableCell>
            <TableCell numeric>{survey.title}</TableCell>
            <TableCell numeric className={classes.containter}>
                <TextField
                    id="startDate"
                    label="startDate"
                    type="date"
                    defaultValue={startDateDisplayDate}
                    onChange={e => changeStartDate(survey, e.target.value)}
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true
                    }}
                />
            </TableCell>
            <TableCell>
                <TextField
                    id="startTime"
                    label="startTime"
                    type="time"
                    defaultValue={startTime}
                    className={classes.textField}
                    onChange={e => changeStartTime(survey, e.target.value)}
                    InputLabelProps={{
                        shrink: true
                    }}
                    inputProps={{
                        step: 300 // 5 min
                    }}
                />
            </TableCell>
            <TableCell numeric className={classes.containter}>
                <TextField
                    id="endDate"
                    label="endDate"
                    type="date"
                    defaultValue={endDateDisplayDate}
                    className={classes.textField}
                    onChange={e => changeEndDate(survey, e.target.value)}
                    InputLabelProps={{
                        shrink: true
                    }}
                />
            </TableCell>
            <TableCell>
                <TextField
                    id="endTime"
                    label="endTime"
                    type="time"
                    defaultValue={endTime}
                    className={classes.textField}
                    onChange={e => changeEndTime(survey, e.target.value)}
                    InputLabelProps={{
                        shrink: true
                    }}
                    inputProps={{
                        step: 300 // 5 min
                    }}
                />
            </TableCell>
            <TableCell numeric>{survey.locationId}</TableCell>
        </TableRow>
    );
});

const SurveyRow = withStyles(styles)(SurveyObjectToTableRow);

const SurveyView = observer((props: { surveys: any[] } & WithStyles) => {
    const { classes, surveys } = props;
    const tableRows = Object.values(toJS(surveys)).map(s => (
        <SurveyRow survey={s} />
    ));
    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Surveyor Email</TableCell>
                        <TableCell numeric>Title</TableCell>
                        <TableCell numeric>Start Date</TableCell>
                        <TableCell numeric>Start Time</TableCell>
                        <TableCell numeric>End Date</TableCell>
                        <TableCell numeric>End Time</TableCell>
                        <TableCell numeric>Zone</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{tableRows}</TableBody>
            </Table>
        </Paper>
    );
});

export default withStyles(styles)(SurveyView);
