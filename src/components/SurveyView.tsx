import camelcaseKeys from 'camelcase-keys';
import React from 'react';
import moment from 'moment';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { closeModalIfVisible } from '../stores/ui';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from 'material-ui-pickers';

import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import applicationState, { addNewSurveyToCurrentStudy } from '../stores/applicationState';
import { Feature } from 'geojson';

const styles = theme => ({
    header: {
        padding: theme.spacing.unit * 3
    },
    table: {
        maxHeight: '300px',
        overflow: 'scroll'
    },
    body: {
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 3
    },
    footer: {
        display: 'flex',
        padding: theme.spacing.unit * 3,
        justifyContent: 'flex-end'
    },
    tableCellRoot: {
        paddingTop: theme.spacing.unit / 2,
        paddingBottom: theme.spacing.unit / 2,
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 2
    }
});

function changeSurveyTitle(surveyId: string, title: string) {
    // We support custom titles, but hypothesize study admins will want them
    // named by time (e.g. 1 pm) instead of naming each one manually
    applicationState.currentStudy.surveys[surveyId].title = title;
}

function changeStartDate(surveyId: string, updatedDateTime: string) {
    applicationState.currentStudy.surveys[surveyId].startDate = updatedDateTime;
}

function changeEndDate(surveyId: string, updatedDateTime: string) {
    applicationState.currentStudy.surveys[surveyId].endDate = updatedDateTime;
}

interface SurveyRowProps {
    survey: {
        surveyId: string;
        startDate: string;
        endDate: string;
        locationId: string;
        email: string;
        title: string;
    };
    features: Feature[];
}

const SurveyObjectToTableRow = observer(
    ({ classes, survey, features }: WithStyles & SurveyRowProps) => {
        const { surveyId, startDate, endDate, locationId } = survey;
        // TODO: remove this once we figure out the deep camel casing issue
        const mapFeatures = camelcaseKeys(features, { deep: true });
        return (
            <TableRow key={surveyId}>
                <TableCell classes={{ root: classes.tableCellRoot }}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <DatePicker
                            value={startDate}
                            margin="normal"
                            format="MMM DD"
                            onChange={(m: moment.Moment) => {
                                // picker uses moment to preserve time and update date
                                changeStartDate(surveyId, m.toISOString());
                                // For now, assume start date and end date will always be the same
                                const newEndDate = moment(endDate)
                                    .year(m.year())
                                    .month(m.month())
                                    .day(m.day())
                                    .toISOString();
                                changeEndDate(surveyId, newEndDate);
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </TableCell>
                <TableCell classes={{ root: classes.tableCellRoot }}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <TimePicker
                            value={startDate}
                            margin="normal"
                            minutesStep={5}
                            onChange={(m: moment.Moment) => {
                                // picker uses moment to preserve date time and update time
                                changeStartDate(surveyId, m.toISOString());
                                changeSurveyTitle(surveyId, m.format('h a'));
                                // assume we want to update end date to be a 1 hour shift
                                changeEndDate(surveyId, m.add(1, 'hours').toISOString());
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </TableCell>
                <TableCell classes={{ root: classes.tableCellRoot }}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <TimePicker
                            value={endDate}
                            margin="normal"
                            minutesStep={5}
                            onChange={(m: moment.Moment) => {
                                // picker uses moment to preserve date time and update time
                                changeEndDate(surveyId, m.toISOString());
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </TableCell>
                <TableCell classes={{ root: classes.tableCellRoot }}>
                    <TextField
                        select
                        fullWidth
                        error={!locationId}
                        value={locationId}
                        onChange={e => {
                            applicationState.currentStudy.surveys[surveyId].locationId =
                                e.target.value;
                        }}
                        margin="normal"
                    >
                        {mapFeatures.map(({ properties }) => {
                            return (
                                <MenuItem key={properties.locationId} value={properties.locationId}>
                                    {properties.name}
                                </MenuItem>
                            );
                        })}
                    </TextField>
                </TableCell>
                <TableCell classes={{ root: classes.tableCellRoot }}>
                    <TextField
                        select
                        fullWidth
                        error={!survey.email}
                        value={survey.email || ''}
                        onChange={e =>
                            (applicationState.currentStudy.surveys[surveyId].email = e.target.value)
                        }
                        margin="normal"
                    >
                        {applicationState.currentStudy.surveyors.map(email => (
                            <MenuItem key={email} value={email}>
                                {email}
                            </MenuItem>
                        ))}
                    </TextField>
                </TableCell>
            </TableRow>
        );
    }
);

const SurveyRow = withStyles(styles)(SurveyObjectToTableRow);

const SurveyView = observer((props: { surveys: any[]; features: Feature[] } & WithStyles) => {
    const { classes, surveys, features } = props;
    const tableRows = Object.values(toJS(surveys))
        .map((s, i) => <SurveyRow key={i} survey={s} features={features} />)
        .reverse();
    return (
        <>
            <div className={classes.header}>
                <Typography variant="h6" color="inherit" gutterBottom>
                    Edit Surveys
                </Typography>
                <Typography variant="subtitle1" color="inherit" gutterBottom>
                    Add a survey for every snapshot. A survey is assigned to a volunteer and a zone.
                    e.g. if you have 1 volunteer taking an hourly snapshot from 12pm to 3pm, you
                    should create 4 surveys (12pm, 1pm, 2pm, and 3pm).
                </Typography>
                <Typography variant="subtitle1" color="inherit" gutterBottom>
                    If you would like to see what your study looks like, assign yourself to a survey
                    and open the CommonSpace app.
                </Typography>
                {!applicationState.currentStudy.surveyors.length && (
                    <Typography variant="body2" color="error" gutterBottom>
                        Before adding surveys, you must add surveyors on the previous screen.
                    </Typography>
                )}
                {!features.length && (
                    <Typography variant="body2" color="error" gutterBottom>
                        Before adding surveys, you must define zones using the zone map on the
                        previous screen.
                    </Typography>
                )}
            </div>
            <div className={classes.body}>
                <Button variant="contained" onClick={addNewSurveyToCurrentStudy}>
                    New Survey
                </Button>
            </div>
            <div className={classes.table}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell classes={{ root: classes.tableCellRoot }}>Date</TableCell>
                            <TableCell classes={{ root: classes.tableCellRoot }}>
                                Start Time
                            </TableCell>
                            <TableCell classes={{ root: classes.tableCellRoot }}>
                                End Time
                            </TableCell>
                            <TableCell classes={{ root: classes.tableCellRoot }}>Zone</TableCell>
                            <TableCell classes={{ root: classes.tableCellRoot }}>
                                Surveyor
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{tableRows}</TableBody>
                </Table>
            </div>
            <div className={classes.footer}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => closeModalIfVisible('surveys')}
                >
                    Return to Study
                </Button>
            </div>
        </>
    );
});

export default withStyles(styles)(SurveyView);
