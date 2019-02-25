import React from 'react';
import moment from 'moment';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import StudyView from './StudyView';

import { observer } from 'mobx-react';

import applicationState, {
    getCurrentStudyId,
    selectNewStudy,
    Study
} from '../stores/applicationState';
import uiState from '../stores/ui';

const styles = theme => ({
    icon: {
        margin: theme.spacing.unit * 2
    },
    borderLessCell: {
        border: 'none'
    },
    expansionPanelDetailsRoot: {
        padding: 0
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
            const { studyId, title, lastUpdated, createdAt } = study;
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
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.borderLessCell}>
                                        {title}
                                    </TableCell>
                                    <TableCell className={classes.borderLessCell}>
                                        {createdAtDate}
                                    </TableCell>
                                    <TableCell className={classes.borderLessCell}>
                                        {lastUpdatedDate}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails classes={{ root: classes.expansionPanelDetailsRoot }}>
                        <StudyView study={study} studyIsNew={false} />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            );
        });
        return (
            <>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Study</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Updated</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                </Table>
                {studiesAsRows}
            </>
        );
    })
);
