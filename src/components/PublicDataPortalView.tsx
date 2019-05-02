import React, { Fragment } from 'react';
import { autorun, toJS } from 'mobx';

import { observer } from 'mobx-react';

import { withStyles, WithStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import ShiftsIcon from '@material-ui/icons/AccessTime';
import StationaryIcon from '@material-ui/icons/DirectionsRun';
import PeopleIcon from '@material-ui/icons/People';
import ActivitiesIcon from '@material-ui/icons/Pool';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import withWidth, { isWidthUp, WithWidth } from '@material-ui/core/withWidth';

import AppBar from './AppBar';
import LockedMapView from './LockedMapView';
import uiState from '../stores/ui';
import applicationState, {
    ApplicationState,
    downloadDataAsCsv,
    getMapCenterForStudy
} from '../stores/applicationState';

interface PublicDataPortalProps {
    studyId: string;
}

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    mainBody: {
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        [theme.breakpoints.up('md')]: {
            width: theme.breakpoints.values.md,
            padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit *
                3}px`
        }
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing.unit * 2,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column'
        }
    },
    title: {
        flexGrow: 1
    },
    iconLink: {
        marginRight: theme.spacing.unit * 3,
        height: '50px',
        textAlign: 'center'
    },
    iconContainer: {
        margin: theme.spacing.unit * 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    },
    description: {
        justifyContent: 'space-between',
        width: '100%',
        textAlign: 'center'
    },
    icon: {
        fontSize: 20,
        opacity: 0.9
    },
    downloadIcon: {
        fontSize: 20,
        opacity: 0.9,
        marginRight: theme.spacing.unit
    },
    iconList: {
        flexGrow: '1',
        display: 'flex',
        justifyContent: 'center'
    },
    map: {
        display: 'flex',
        width: '100%',
        maxWidth: '700px',
        height: '300px',
        margin: 'auto',
        [theme.breakpoints.down('sm')]: {
            width: '100%'
        }
    },
    mapEdit: {
        marginTop: '0px'
    },
    paperContainer: {
        [theme.breakpoints.up('md')]: {
            marginBottom: theme.spacing.unit * 2
        }
    },
    halo: {
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.unit
    }
});

const PublicDataPortal = observer((props: PublicDataPortalProps & WithStyles & WithWidth) => {
    const { studyId, classes, width } = props;
    const { currentStudy } = applicationState;
    if (!currentStudy) {
        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar rightHeaderType="none" />
                <div className={classes.mainBody}>
                    <div className={classes.header}>
                        <Typography variant="h6"> Study does not exist.</Typography>
                    </div>
                </div>
            </div>
        );
    }
    let {
        author,
        authorUrl,
        description,
        fields,
        surveys = {},
        surveyors,
        status,
        title,
        map,
        type,
        datapoints = [],
        lastUpdated,
        // isPublic,
        createdAt
    } = currentStudy;
    // Hardcoded for now, will be passed in with currentStudy
    const isPublic = false;
    const { latitude, longitude } = getMapCenterForStudy(studyId);
    const startDate = new Date(surveys[surveys.length - 1].start_date).toLocaleDateString();
    const endDate = new Date(surveys[0].start_date).toLocaleDateString();

    return (
        <div className={classes.root}>
            <AppBar rightHeaderType={!isPublic ? 'none' : 'account-menu'} />
            <div className={classes.mainBody}>
                {!isPublic && (
                    <div className={classes.header}>
                        <Typography variant="h6"> Study is not public.</Typography>
                    </div>
                )}
                {isPublic && (
                    <Fragment>
                        <Paper className={classes.paperContainer}>
                            <div className={classes.row}>
                                <div>
                                    <Typography
                                        component="h1"
                                        variant="h5"
                                        color="inherit"
                                        noWrap
                                        gutterBottom
                                        className={classes.title}
                                    >
                                        {title}
                                    </Typography>
                                    <div className={classes.subheader}>
                                        <Typography color="textSecondary" variant="subtitle2">
                                            {startDate} - {endDate}
                                        </Typography>
                                    </div>
                                    <div className={classes.subheader}>
                                        <Typography color="textSecondary" variant="subtitle2">
                                            Study Status: {status}
                                        </Typography>
                                    </div>
                                </div>
                                <div>
                                    {isWidthUp('sm', width) && (
                                        <Button
                                            color="primary"
                                            className={classes.iconLinks}
                                            onClick={() => downloadDataAsCsv(studyId)}
                                            disabled={!datapoints.length}
                                        >
                                            <DownloadIcon className={classes.downloadIcon} />
                                            Download Data
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <Divider variant="middle" />
                            <div className={classes.row}>
                                <div className={classes.description}>
                                    <Typography variant="body2">{description}</Typography>
                                </div>
                            </div>
                            <div className={classes.row}>
                                <div className={classes.iconList}>
                                    <div className={classes.iconContainer}>
                                        <div className={classes.halo}>
                                            <StationaryIcon
                                                color="primary"
                                                className={classes.icon}
                                            />
                                        </div>
                                        <Typography color="primary" variant="body2">
                                            {type === 'stationary' && 'Stationary Count'}
                                            {type === 'movement' && 'Line of Sight'}
                                        </Typography>
                                    </div>
                                    <div className={classes.iconContainer}>
                                        <div className={classes.halo}>
                                            <ShiftsIcon color="primary" className={classes.icon} />
                                        </div>
                                        <Typography color="primary" variant="body2">
                                            {surveys.length} Survey
                                            {surveys.length === 1 && ' Shift'}
                                            {surveys.length > 1 && ' Shifts'}
                                        </Typography>
                                    </div>
                                    <div className={classes.iconContainer}>
                                        <div className={classes.halo}>
                                            <ActivitiesIcon
                                                color="primary"
                                                className={classes.icon}
                                            />
                                        </div>
                                        <Typography color="primary" variant="body2">
                                            {fields.length - 1} Activities
                                        </Typography>
                                    </div>
                                    <div className={classes.iconContainer}>
                                        <div className={classes.halo}>
                                            <PeopleIcon color="primary" className={classes.icon} />
                                        </div>
                                        <Typography color="primary" variant="body2">
                                            {datapoints.length} Data Points
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                            <Divider variant="middle" />
                            <div className={classes.row}>
                                <div className={classes.map}>
                                    <LockedMapView
                                        isEditable={false}
                                        showOverlay={false}
                                        lat={latitude}
                                        lng={longitude}
                                        featureCollection={map}
                                        className={classes.mapEdit}
                                    />
                                </div>
                            </div>
                        </Paper>
                        <Paper className={classes.paperContainer}>
                            <div className={classes.row}>
                                <Typography
                                    component="h1"
                                    variant="h6"
                                    color="inherit"
                                    noWrap
                                    gutterBottom
                                    className={classes.title}
                                >
                                    Organizers
                                </Typography>
                            </div>
                            <Divider variant="fullWidth" />
                            <div className={classes.row}>
                                <div className={classes.subheader}>
                                    <Typography variant="subtitle2"> {author} </Typography>
                                </div>
                                <div>
                                    <Typography color="textSecondary" variant="subtitle2">
                                        Last Updated: {new Date(lastUpdated).toLocaleDateString()}
                                    </Typography>
                                    <Typography color="textSecondary" variant="subtitle2">
                                        Created Study: {new Date(createdAt).toLocaleDateString()}
                                    </Typography>
                                </div>
                                <div style={{ maxWidth: '300px' }}>
                                    <a href={authorUrl} target="_blank">
                                        <Typography
                                            noWrap
                                            gutterBottom
                                            color="inherit"
                                            variant="subtitle2"
                                        >
                                            {authorUrl}
                                        </Typography>
                                    </a>
                                </div>
                            </div>
                        </Paper>
                    </Fragment>
                )}
            </div>
        </div>
    );
});

// @ts-ignore
export default withWidth()(withStyles(styles)(PublicDataPortal));
