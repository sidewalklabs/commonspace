import React from 'react';
import moment from 'moment';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import StudyView from './StudyView';

import { observer } from 'mobx-react';

import applicationState, {
    getCurrentStudyId,
    selectNewStudy,
    Study
} from '../stores/applicationState';
import uiState from '../stores/ui';

const styles = theme => ({
    columnTitle: {
        flex: 1,
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingRight: theme.spacing.unit * 3
    },
    columnDate: {
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingRight: theme.spacing.unit * 3,
        flexBasis: '180px'
    },
    expansionPanelDetailsRoot: {
        padding: 0,
        paddingTop: theme.spacing.unit * 3,
        borderTop: `1px solid ${theme.palette.divider}`
    }
});

async function transitionToViewStudy(study) {
    uiState.currentStudyIsNew = false;
    await selectNewStudy(study);
}

export interface StudiesListProps {
    studies: { [key: string]: Study };
}

export default withStyles(styles)(
    observer((props: StudiesListProps & WithStyles) => {
        const { studies, classes } = props;
        const studiesAsRows = Object.values(studies).map((study, index) => {
            const { studyId, title, lastUpdated, createdAt, location } = study;
            const createdAtDate = moment(createdAt).format('MMM D, YYYY');
            const lastUpdatedDate = moment(lastUpdated).format('MMM D, YYYY');
            const expanded = getCurrentStudyId() === studyId;
            return (
                <ExpansionPanel
                    key={studyId}
                    expanded={expanded}
                    onChange={() => {
                        if (expanded) {
                            applicationState.currentStudy = null;
                        } else {
                            transitionToViewStudy(study);
                        }
                    }}
                >
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <div className={classes.columnTitle}>
                            <Typography color="primary" variant="body2">
                                {title}
                            </Typography>
                        </div>
                        <div className={classes.columnDate}>
                            <Typography color="textSecondary" variant="subtitle2">
                                {location}
                            </Typography>
                        </div>
                        <div className={classes.columnDate}>
                            <Typography color="textSecondary" variant="body2">
                                {createdAtDate}
                            </Typography>
                        </div>
                        <div className={classes.columnDate}>
                            <Typography color="textSecondary" variant="body2">
                                {lastUpdatedDate}
                            </Typography>
                        </div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails classes={{ root: classes.expansionPanelDetailsRoot }}>
                        <StudyView study={study} studyIsNew={false} />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            );
        });
        return (
            <>
                <ExpansionPanel expanded={false}>
                    <ExpansionPanelSummary style={{ cursor: 'default', pointerEvents: 'none' }}>
                        <div className={classes.columnTitle}>
                            <Typography variant="subtitle2">Study</Typography>
                        </div>
                        <div className={classes.columnDate}>
                            <Typography variant="subtitle2">Location</Typography>
                        </div>
                        <div className={classes.columnDate}>
                            <Typography variant="subtitle2">Created</Typography>
                        </div>
                        <div className={classes.columnDate}>
                            <Typography variant="subtitle2">Updated</Typography>
                        </div>
                    </ExpansionPanelSummary>
                </ExpansionPanel>
                {studiesAsRows}
            </>
        );
    })
);
