import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { observer } from 'mobx-react';

import { navigate } from '../stores/router';
import logInState, { logInUser } from '../stores/login';

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
    logInButton: {
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

// @ts-ignore
const LoginWithEmailView = withStyles(styles)(
    observer((props: WithStyles) => {
        const { classes } = props;
        return (
            <Paper className={classes.root}>
                <Avatar
                    alt="Commons Icon"
                    src="/assets/images/CircleIcon.png"
                    className={classes.avatar}
                />
                <Typography variant="h6" align="center" gutterBottom>
                    Login to CommonSpace
                </Typography>
                <TextField
                    id="login-email"
                    label="Email"
                    onChange={e => (logInState.email = e.target.value)}
                    error={logInState.emailErrorMessage ? true : false}
                    className={classes.textField}
                />
                <TextField
                    id="login-password"
                    label="Password"
                    type="password"
                    onChange={e => (logInState.password = e.target.value)}
                    error={logInState.passwordErrorMessage ? true : false}
                    className={classes.textField}
                />
                <Fab
                    classes={{
                        root: classes.logInButton,
                        label: classes.buttonLabel
                    }}
                    variant="extended"
                    onClick={logInUser}
                >
                    Log In
                </Fab>
                <Button onClick={() => navigate('/reset')}>Forgot Password</Button>
                <Button onClick={() => navigate('/signup')}>Sign Up</Button>
            </Paper>
        );
    })
);

export default LoginWithEmailView;
