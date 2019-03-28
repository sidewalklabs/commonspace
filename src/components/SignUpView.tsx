import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { observer } from 'mobx-react';

import signUpState, { signUpUser } from '../stores/signup';
import { navigate } from '../stores/router';

const styles = theme => ({
    hyperlinkText: {
        margin: theme.spacing.unit,
        alignContent: 'flex-end',
        width: 150
    },
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
    signUpButton: {
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
const SignUpView = withStyles(styles)(
    observer((props: WithStyles) => {
        const { classes } = props;
        return (
            <Paper className={classes.root}>
                <Avatar
                    alt="Commons Icon"
                    src="/assets/images/AppIconSVG.svg"
                    className={classes.avatar}
                />
                <Typography variant="h6" align="center" gutterBottom>
                    Sign up for CommonSpace
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                    CommonSpace Admin is in private beta. Contact &nbsp;
                    <a href="mailto:commonspace@sidewalklabs.com">commonspace@sidewalklabs.com</a>
                    &nbsp;if you are interested in administering studies.
                </Typography>
                <TextField
                    id="signUp-email"
                    label="Email"
                    onChange={e => (signUpState.email = e.target.value)}
                    error={signUpState.emailErrorMessage ? true : false}
                    className={classes.textField}
                />
                <TextField
                    id="signUp-password"
                    label="Password"
                    type="password"
                    onChange={e => (signUpState.password = e.target.value)}
                    error={signUpState.passwordErrorMessage ? true : false}
                    className={classes.textField}
                />
                <TextField
                    id="signUp-password-confirmation"
                    label="Re-Enter Password"
                    type="password"
                    onChange={e => (signUpState.passwordConfirmation = e.target.value)}
                    error={signUpState.passwordConfirmationErrorMessage ? true : false}
                    className={classes.textField}
                />
                <Fab
                    classes={{
                        root: classes.signUpButton,
                        label: classes.buttonLabel
                    }}
                    variant="extended"
                    onClick={signUpUser}
                >
                    Sign Up
                </Fab>
                <Button onClick={() => navigate('/login')}>Already Signed Up? Login Here</Button>
            </Paper>
        );
    })
);

export default SignUpView;
