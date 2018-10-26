import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'

import { observer } from 'mobx-react';

import signUpState, { signUpUser } from '../stores/signup'


const styles = theme => ({
    root: {
        width: '30%',
        marginTop: theme.spacing.unit * 3,
        flex: '1 0 auto',
        flexDirection: 'column'
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
                onChange={e => signUpState.password = e.target.value}
                error={signUpState.passwordErrorMessage ? true : false}
                className={classes.textField} />
            <TextField
                id="signUp-password-confirmation"
                label="Re-Enter Password"
                onChange={e => signUpState.passwordConfirmation = e.target.value}
                error={signUpState.passwordConfirmationErrorMessage ? true : false}
                className={classes.textField} />
            <Button variant="contained" color="primary" onClick={signUpUser}>
                Sign Up
            </Button>
        </Paper>
    )
}))

export default SignUpView;
