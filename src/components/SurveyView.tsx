import React, { ChangeEvent } from 'react';
import moment from 'moment';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import uuidv4 from 'uuid/v4';

import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import applicationState, { addNewSurveyToCurrentStudy } from '../stores/applicationState';
import { groupArrayOfObjectsBy } from '../utils';
import { Feature } from 'geojson';

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 80,
    },
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

interface SurveyRowProps {
    survey: {
        surveyId: string;
        startDate: string;
        endDate: string;
        locationId: string;
        surveyorEmail: string;
        title: string;
    };
    features: Feature[];
}

const SurveyObjectToTableRow = observer(({ classes, survey, features }: WithStyles & SurveyRowProps) => {
    const { surveyId } = survey;
    const startDate = moment(survey.startDate);
    const startDateDisplayDate = startDate.format('YYYY-MM-DD');
    const startTime = startDate.format('kk:mm');
    const endDate = moment(survey.endDate);
    const endDateDisplayDate = endDate.format('YYYY-MM-DD');
    const endTime = endDate.format('kk:mm');
    let locationName;
    if (features.length > 0 && survey.locationId) {
        const properties = toJS(features).map(({ properties }) => properties);
        locationName = groupArrayOfObjectsBy(properties, 'locationId')[survey.locationId].name;
    } else if (features.length > 0) {
        locationName = features[0].properties.name;
    } else {
        locationName = '';
    }
    return (
        <TableRow key={surveyId}>
            <TableCell component="th" scope="row">
                <TextField
                    select
                    className={classes.textField}
                    value={survey.surveyorEmail ? survey.surveyorEmail : ''}
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
                    label="Title"
                    className={classes.textField}
                    value={survey.title}
                    onChange={e => applicationState.currentStudy.surveys[surveyId].title = e.target.value}
                    margin="normal"
                />
            </TableCell>
            <DateTableCell displayDate={startDateDisplayDate} onUpdate={e => {
                changeStartDate(survey, e.target.value);
                changeEndDate(survey, e.target.value);
            }} />
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
                <TextField
                    className={classes.textField}
                    select
                    value={locationName}
                    onChange={e => applicationState.currentStudy.surveys[surveyId].locationId = e.target.value}
                    margin="normal"
                >
                    {features.map(({ properties }) => (
                        <MenuItem key={properties.locationId} value={properties.locationId}>
                            {properties.name}
                        </MenuItem>
                    ))}
                </TextField>
            </TableCell>
        </TableRow>
    );
});

const SurveyRow = withStyles(styles)(SurveyObjectToTableRow);

const SurveyView = observer((props: { surveys: any[], features: Feature[] } & WithStyles) => {
    const { classes, surveys, features } = props;
    const tableRows = Object.values(toJS(surveys)).map(s => (
        <SurveyRow survey={s} features={features} />
    ));
    return (
        <Paper className={classes.root}>
            <Typography
                component="h2"
                variant="title"
                color="inherit"
                noWrap
                className={classes.title}
            >
                Edit Surveys
            </Typography>
            <Button color="primary" variant="contained" onClick={addNewSurveyToCurrentStudy}>New Survey</Button>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Surveyor Email</TableCell>
                        <TableCell numeric>Title</TableCell>
                        <TableCell numeric>Start Date</TableCell>
                        <TableCell numeric>Start Time</TableCell>
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
