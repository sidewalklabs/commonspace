import React from 'react';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import { observer } from 'mobx-react';

import { selectNewStudy, Study } from '../stores/applicationState';
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

export interface StudiesListProps {
    studies: { [key: string]: Study };
}

export default withStyles(styles)(observer((props: StudiesListProps & WithStyles) => {
    const { classes, studies } = props;
    const studiesAsRows = Object.values(studies).map(study => {
        const { studyId, title } = study;
        return (
            <TableRow key={studyId}>
                <TableCell onClick={async () => await transitionToViewStudy(study)}>{title}</TableCell>
                <TableCell>Oct 20, 2018</TableCell>
                <TableCell>Nov 20, 2018</TableCell>
                <TableCell numeric><ExpandMore className={classes.icon} /></TableCell>
            </TableRow>
        );
    });
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Study</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell numeric></TableCell>
                </TableRow>
            </TableHead>
            {studiesAsRows}
        </Table>
    )
}));
