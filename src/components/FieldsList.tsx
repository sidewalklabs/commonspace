import React from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import Modal from '@material-ui/core/Modal';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import applicationState from '../stores/applicationState';
import { StudyField } from '../datastore/utils';

const AVAILABLE_FIELDS: StudyField[] = ['gender', 'age', 'mode', 'posture', 'activities', 'groups', 'object', 'location', 'note']

const styles = theme => ({
    root: {
        width: '100%',
        height: '40%',
        marginTop: theme.spacing.unit * 3,
        overflow: 'auto'
    }
})

interface FieldsListProps {
    fields: string[]
}

// @ts-ignore
const FieldsList = withStyles(styles)(observer((props: FieldsListProps & WithStyles) => {
    const { classes, fields } = props;
    const { currentStudy } = applicationState;

    const chips = AVAILABLE_FIELDS.map(possibleField => {
        const index = fields.indexOf(possibleField);
        if (index === -1) {
            // for ux reasons, it's best to present the buttons in a consistent order
            const newFields = [...currentStudy.fields, possibleField];
            newFields.sort((a, b) => AVAILABLE_FIELDS.indexOf(a) - AVAILABLE_FIELDS.indexOf(b));
            return (< Chip
                label={possibleField}
                onClick={() => {
                    currentStudy.fields = newFields;
                }}
                className={classes.chip}
            />)
        } else {
            return (< Chip
                label={possibleField}
                onDelete={() => {
                    currentStudy.fields.splice(index, 1)
                    currentStudy.fields = [...currentStudy.fields];
                }}
                className={classes.chip}
            />)
        }
    });
    return (
        <Paper className={classes.root}>
            <Typography
                component="h2"
                variant="title"
                color="inherit"
                noWrap
            >
                Choose Fields
            </Typography>
            {chips}
        </Paper>
    )
}));

export default FieldsList;
