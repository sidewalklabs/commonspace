import React from 'react';
import { observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import SurveyView from './SurveyView';

import applicationState, { persistStudy } from '../stores/applicationState';

const styles = theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200
    },
    rightCornerButton: {
        margin: theme.spacing.unit,
        alignContent: 'flex-end',
        width: 150
    }
});

const StudyView = observer((props: any & WithStyles) => {
    const PROTOCOL_SELECTIONS = [
        {
            value: 'beta',
            label: 'beta'
        },
        {
            value: 'latest',
            label: '1.0'
        },
        {
            value: '1.0',
            label: '1.0'
        }
    ];

    const { classes } = props;
    if (applicationState.currentStudy) {
        const { title, surveys, studyId } = applicationState.currentStudy;
        return (
            <div className={classes.container}>
                <TextField
                    id="study-title"
                    label="Title"
                    className={classes.textField}
                    value={title}
                    onChange={e => console.log('new survey name: ', e.target.value)}
                    margin="normal"
                />
                <TextField
                    id="select-protocol-version"
                    select
                    label="Gehl Protocol Version"
                    className={classes.textField}
                    value={PROTOCOL_SELECTIONS.map(x => x.label)}
                    onChange={e =>
                        console.log(
                            'protocol update: ',
                            PROTOCOL_SELECTIONS[e.target.value]
                        )
                    }
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu
                        }
                    }}
                    helperText="Please select your currency"
                    margin="normal"
                />
                <SurveyView surveys={surveys} />
                <Button variant="contained" color="primary" className={classes.rightCornerButton} onClick={() => persistStudy(applicationState.studies[studyId])}>
                    Update
               </Button>
            </div >
        );
    }
    return null;
});

export default withStyles(styles)(StudyView);
