import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { observer } from 'mobx-react';

import signUpState, { signUpUser } from '../stores/signup'
import uiState from '../stores/ui'

const styles = theme => ({
    hyperlinkText: {
        margin: theme.spacing.unit,
        alignContent: 'flex-end',
        width: 150
    },
    root: {
        width: '30%',
        marginTop: theme.spacing.unit * 3,
        flex: '1 0 auto',
        flexDirection: 'column'
    },
    button: {
        justifyContent: 'flex-end',
        alignContent: 'flex-end'
    },
    table: {
        minWidth: 400,
        overflow: 'auto'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '100%'
    }
})

const SignUpView = withStyles(styles)(observer((props: WithStyles) => {
    const { classes } = props;
    return (
        <Paper className={classes.root}>
            <TextField
                id="signUp-email"
                label="Email"
                onChange={e => signUpState.email = e.target.value}
                error={signUpState.emailErrorMessage ? true : false}
                className={classes.textField} />
            <TextField
                id="signUp-name"
                label="Name"
                onChange={e => signUpState.name = e.target.value}
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
            <Button className={classes.signUpButton} variant="contained" color="primary" onClick={signUpUser}>
                Sign Up
            </Button>
            <Button color="secondary" className={classes.button} onClick={() => uiState.login = true}>
                Already Signed Up? Login Here
            </Button>
        </Paper >
    )
}))

export default SignUpView;
