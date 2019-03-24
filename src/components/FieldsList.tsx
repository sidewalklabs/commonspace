import React from 'react';
import { observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';

import applicationState from '../stores/applicationState';
import { StudyField } from '../datastore/utils';
import { StudyType } from '../datastore/study';

import uiState, { closeModalIfVisible } from '../stores/ui';

const AVAILABLE_FIELDS: StudyField[] = [
    'gender',
    'age',
    'mode',
    'posture',
    'activities',
    'groups',
    'object'
];

const styles = theme => ({
    header: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing.unit * 3
    },
    body: {
        padding: theme.spacing.unit * 3
    },
    footer: {
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        padding: theme.spacing.unit * 3,
        justifyContent: 'flex-end'
    },
    chip: {
        margin: theme.spacing.unit / 2
    }
});

interface FieldsListProps {
    fields: StudyField[];
    studyType: StudyType;
}

// @ts-ignore
const FieldsList = withStyles(styles)(
    observer((props: FieldsListProps & WithStyles) => {
        const { classes, fields, studyType } = props;
        const { currentStudy } = applicationState;

        const chips = AVAILABLE_FIELDS.map(possibleField => {
            // we don't allow our user to chooose mode for stationary studies
            if (studyType === 'stationary' && possibleField === 'mode') {
                return null;
            }
            const index = fields.indexOf(possibleField);
            const isSelected = index >= 0;
            let onClick = undefined;
            let onDelete = undefined;

            if (isSelected) {
                onDelete = () => {
                    currentStudy.fields.splice(index, 1);
                    currentStudy.fields = [...currentStudy.fields];
                };
            } else {
                onClick = () => {
                    // for ux reasons, it's best to present the buttons in a consistent order
                    const newFields = [...currentStudy.fields, possibleField];
                    newFields.sort(
                        (a, b) => AVAILABLE_FIELDS.indexOf(a) - AVAILABLE_FIELDS.indexOf(b)
                    );
                    currentStudy.fields = newFields;
                };
            }
            return (
                <Chip
                    key={possibleField}
                    label={possibleField}
                    onClick={onClick}
                    onDelete={onDelete}
                    color={isSelected ? 'primary' : 'default'}
                    className={classes.chip}
                />
            );
        });
        return (
            <>
                <div className={classes.header}>
                    <Typography component="h2" variant="h6" color="inherit" gutterBottom noWrap>
                        Study Fields
                    </Typography>
                    <Typography variant="subtitle1" color="inherit" gutterBottom noWrap>
                        Click on the fields you would like your surveyors to study.
                    </Typography>
                </div>
                <div className={classes.body}>{chips}</div>
                <div className={classes.footer}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => closeModalIfVisible('studyFields')}
                    >
                        Return to Study
                    </Button>
                </div>
            </>
        );
    })
);

export default FieldsList;
