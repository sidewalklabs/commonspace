import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { observer } from 'mobx-react';

import signUpState, { signUpUser } from '../stores/signup'
import { navigate } from '../stores/router'
import { setSnackBar } from '../stores/ui';

const styles = theme => ({
    hyperlinkText: {
        margin: theme.spacing.unit,
        alignContent: 'flex-end',
        width: 150
    },
    root: {
        width: '700px',
        display: 'flex',
        marginTop: theme.spacing.unit * 3,
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        flex: '0 1 auto',
        alignItems: 'center',
        flexDirection: 'column',
        alignContent: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`
    },
    avatar: {
        marginBottom: theme.spacing.unit * 2,
    },
    signUpButton: {
        margin: theme.spacing.unit * 3,
        width: '100%',
        maxWidth: '400px',
        boxShadow: "none",
    },
    buttonLabel: {
        textTransform: 'none',
    },
    textField: {
        margin: theme.spacing.unit,
        width: '100%',
        maxWidth: '400px',
    }
});

const responseGoogleFailure = (response) => {
    console.error(response);
    setSnackBar('error', 'Unable to authenticate with Google OAuth');
}

// @ts-ignore
const SignUpView = withStyles(styles)(observer((props: WithStyles) => {
    const { classes } = props;
    return (
        <Paper className={classes.root}>
            <Avatar alt="Commons Icon" src="/assets/images/CircleIcon.png" className={classes.avatar} />
            <Typography variant="title" gutterBottom>Sign up for CommonSpace</Typography>
            <Typography variant="body1">CommonSpace Admin is in beta, and sign up will fail if you have not been approved.</Typography>
            <Typography variant="body1">Contact product-support@sidewalklabs.com if you are interested in administering studies.</Typography>
            <TextField
                id="signUp-email"
                label="Email"
                onChange={e => signUpState.email = e.target.value}
                error={signUpState.emailErrorMessage ? true : false}
                className={classes.textField} />
            <TextField
                id="signUp-password"
                label="Password"
                type="password"
                onChange={e => signUpState.password = e.target.value}
                error={signUpState.passwordErrorMessage ? true : false}
                className={classes.textField} />
            <TextField
                id="signUp-password-confirmation"
                label="Re-Enter Password"
                type="password"
                onChange={e => signUpState.passwordConfirmation = e.target.value}
                error={signUpState.passwordConfirmationErrorMessage ? true : false}
                className={classes.textField} />
            <Button classes={{
                root: classes.signUpButton,
                label: classes.buttonLabel
            }} variant="extendedFab" onClick={signUpUser}>
                Sign Up
            </Button>
            <Button onClick={() => navigate('/welcome')}>
                Already Signed Up? Login Here
            </Button>
        </Paper >
    )
}))

export default SignUpView;
