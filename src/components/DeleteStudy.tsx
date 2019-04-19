import React from 'react';
import { observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { deleteStudy, Study } from '../stores/applicationState';
import { closeModalIfVisible } from '../stores/ui';

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
    footerButton: {
        marginRight: theme.spacing.unit
    }
});

interface DeleteStudyProps {
    study: Study;
}

// @ts-ignore
const DeleteStudy = withStyles(styles)(
    observer((props: DeleteStudyProps & WithStyles) => {
        const { classes, study } = props;
        return (
            <>
                <div className={classes.header}>
                    <Typography component="h2" variant="h6" color="inherit" gutterBottom noWrap>
                        Are you sure you want to delete study?
                    </Typography>
                    <Typography variant="subtitle1" color="inherit" gutterBottom noWrap>
                        You will NOT be able to recover your data.
                    </Typography>
                </div>
                <div className={classes.footer}>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.footerButton}
                        onClick={() => closeModalIfVisible('deleteStudy')}
                    >
                        Go back
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.footerButton}
                        onClick={() => {
                            deleteStudy(study.studyId);
                            closeModalIfVisible('deleteStudy');
                        }}
                    >
                        Delete Study
                    </Button>
                </div>
            </>
        );
    })
);

export default DeleteStudy;
