import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { navigate } from '../stores/router';
import { setSnackBar } from '../stores/ui';
import { checkPasswordInput, SignupFormValidationError } from '../stores/signup';

interface ResetPasswordProps {
    token: string;
}

const fetchParams: RequestInit = {
    //mode: "sam", // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
};

const state = observable({
    password: '',
    verifyPassword: '',
    matchingPasswordErrorMessage: false
});

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
    textField: {
        margin: theme.spacing.unit,
        width: '100%',
        maxWidth: '400px'
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
    avatar: {
        marginBottom: theme.spacing.unit * 2
    }
});

async function ResetPasswordRequest(token: string) {
    const { password, verifyPassword } = state;
    if (password !== verifyPassword) {
        setSnackBar('error', 'Passwords must match');
        state.matchingPasswordErrorMessage = true;
        return;
    }
    try {
        checkPasswordInput(password);
    } catch (error) {
        if (error instanceof SignupFormValidationError) {
            setSnackBar('error', error.message);
        }
        return;
    }
    const body = { password };
    const response = await fetch(`/auth/reset_password?token=${token}`, {
        ...fetchParams,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(body)
    });
    if (response.status === 200) {
        navigate('/studies');
    } else {
        console.error(response.status);
        console.error(response.statusText);
        setSnackBar('error', `Unable to Reset Password ${response.statusText}`);
    }
}

const ResetPassword = observer((props: ResetPasswordProps & WithStyles) => {
    const { classes, token } = props;
    return (
        <Paper className={classes.root}>
            <Avatar
                alt="Commons Icon"
                src="/assets/images/CircleIcon.png"
                className={classes.avatar}
            />
            <Typography variant="h6" align="center" gutterBottom>
                Reset Password
            </Typography>
            <TextField
                id="password"
                label="New Password"
                type="password"
                onChange={e => (state.password = e.target.value)}
                className={classes.textField}
            />
            <TextField
                id="verify-password"
                label="Verify Password"
                type="password"
                onChange={e => (state.verifyPassword = e.target.value)}
                error={state.matchingPasswordErrorMessage ? true : false}
                className={classes.textField}
            />
            <Fab
                classes={{
                    root: classes.button,
                    label: classes.buttonLabel
                }}
                variant="extended"
                onClick={async () => await ResetPasswordRequest(token)}
            >
                Reset
            </Fab>
        </Paper>
    );
});

// @ts-ignore
export default withStyles(styles)(ResetPassword);
