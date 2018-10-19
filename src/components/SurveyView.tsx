import React, { ChangeEvent } from 'react';
import moment from 'moment';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import uuidv4 from 'uuid/v4';

import { get, set, toJS } from 'mobx';
import { observer } from 'mobx-react';

import applicationState, { addNewSurveyToCurrentStudy } from '../stores/applicationState';
import uiState from '../stores/ui';
import { groupArrayOfObjectsBy } from '../utils';

const styles = theme => ({
    root: {
        width: '100%',
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

export interface DateTableCellProps {
    displayDate: string;
    onUpdate: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => void;
    label?: string;
}

const DateTableCell = withStyles(styles)(observer((props: DateTableCellProps & WithStyles) => {
    const { displayDate, onUpdate, classes, label } = props;
    return (
        <TableCell numeric className={classes.containter}>
            <TextField
                label={label}
                type="date"
                defaultValue={displayDate}
                onChange={e => onUpdate(e)}
                className={classes.textField}
                InputLabelProps={{
                    shrink: true
                }}
            />
        </TableCell>
    )
}));

const SurveyObjectToTableRow = observer(({ classes, survey }) => {
    const { surveyId } = survey;
    const startDate = moment(survey.startDate);
    const startDateDisplayDate = startDate.format('YYYY-MM-DD');
    const startTime = startDate.format('kk:mm');
    const endDate = moment(survey.endDate);
    const endDateDisplayDate = endDate.format('YYYY-MM-DD');
    const endTime = endDate.format('kk:mm');
    let surveyName;
    if (uiState.availableLocations.length > 0 && survey.locationId) {
        surveyName = groupArrayOfObjectsBy(uiState.availableLocations, 'locationId')[survey.locationId].name;
    } else if (uiState.availableLocations.length > 0) {
        console.log('hey: ', toJS(uiState.availableLocations));
        surveyName = uiState.availableLocations[0].name;
    } else {
        surveyName = '';
    }
    return (
        <TableRow key={surveyId}>
            <TableCell component="th" scope="row">
            </TableCell>
            <TableCell component="th" scope="row">
                <TextField
                    id="surveyor-email"
                    select
                    className={classes.textField}
                    value={survey.surveyorEmail}
                    onChange={e => applicationState.currentStudy.surveys[surveyId].surveyorEmail = e.target.value}
                    margin="normal"
                >
                    {applicationState.currentStudy.surveyors.map(email => (
                        <MenuItem key={email} value={email}>
                            {email}
                        </MenuItem>
                    ))}
                </TextField>
            </TableCell>
            <TableCell numeric>
                <TextField
                    id="survey-title"
                    label="Title"
                    className={classes.textField}
                    value={survey.title}
                    onChange={e => applicationState.currentStudy.surveys[surveyId].title = e.target.value}
                    margin="normal"
                />
            </TableCell>
            <DateTableCell displayDate={startDateDisplayDate} onUpdate={e => changeStartDate(survey, e.target.value)} />
            <TableCell>
                <TextField
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
            <DateTableCell displayDate={endDateDisplayDate} onUpdate={e => changeEndDate(survey, e.target.value)} />
            <TableCell>
                <TextField
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
            <TableCell component="th" scope="row">
                <Select
                    name={surveyName}
                    onChange={(e) => applicationState.currentStudy.surveys[surveyId].locationId = e.target.value}
                    inputProps={{
                        name: 'locationId',
                        id: 'survey-location',
                    }}
                >
                    {uiState.availableLocations.map(({ name, locationId }) => (
                        <MenuItem key={locationId} value={locationId}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </TableCell>
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
                        <TableCell onClick={addNewSurveyToCurrentStudy}>Add</TableCell>
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
        </Paper >
    );
});

export default withStyles(styles)(SurveyView);
