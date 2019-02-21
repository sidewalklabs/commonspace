import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { observer } from 'mobx-react';
import resetState, { resetPasswordRequest } from '../stores/reset';

import { navigate } from '../stores/router';

const styles = theme => ({
    root: {
        width: 'auto',
        margin: 0,
        height: '100%',
        [theme.breakpoints.up(700 + theme.spacing.unit * 3 * 2)]: {
            width: 700,
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: theme.spacing.unit * 3,
            height: 'auto'
        },
        display: 'flex',
        flex: '0 1 auto',
        alignItems: 'center',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit *
            3}px`
    },
    avatar: {
        marginBottom: theme.spacing.unit * 2
    },
    button: {
        margin: theme.spacing.unit * 3,
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'none'
    },
    buttonLabel: {
        textTransform: 'none'
    },
    textField: {
        margin: theme.spacing.unit,
        width: '100%',
        maxWidth: '400px'
    }
});

interface ResetProps {
    email: string;
}

const ResetView = observer((props: ResetProps & WithStyles) => {
    const { classes, email } = props;
    return (
        <Paper className={classes.root}>
            <Avatar
                alt="Commons Icon"
                src="/assets/images/CircleIcon.png"
                className={classes.avatar}
            />
            <Typography variant="title" align="center" gutterBottom>
                Reset Password
            </Typography>
            <Typography variant="body1" align="center">
                Enter your account email to receive instructions on how to reset your password
            </Typography>
            <TextField
                id="login-email"
                label="Email"
                onChange={e => (resetState.email = e.target.value)}
                className={classes.textField}
            />
            <Button
                classes={{
                    root: classes.button,
                    label: classes.buttonLabel
                }}
                variant="extendedFab"
                onClick={async () => await resetPasswordRequest()}
            >
                Send
            </Button>
            <Button onClick={() => navigate('/login')}>Back to Log In</Button>
        </Paper>
    );
});

// @ts-ignore
export default withStyles(styles)(ResetView);
