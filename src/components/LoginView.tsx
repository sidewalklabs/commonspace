import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { observer } from 'mobx-react';

import uiState, { AuthMode } from '../stores/ui'
import logInState, { logInUser } from '../stores/login'

const styles = theme => ({
    hyperlinkText: {
        margin: theme.spacing.unit,
        alignContent: 'flex-end',
        width: 150
    },
    root: {
        width: '45%',
        marginTop: theme.spacing.unit * 3,
        flex: '0 1 auto',
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
                id="login-email"
                label="Email"
                onChange={e => logInState.email = e.target.value}
                error={logInState.emailErrorMessage ? true : false}
                className={classes.textField} />
            <TextField
                id="login-password"
                label="Password"
                type="password"
                onChange={e => logInState.password = e.target.value}
                error={logInState.passwordErrorMessage ? true : false}
                className={classes.textField} />
            <Button className={classes.button} variant="contained" color="primary" onClick={logInUser}>
                Log In
            </Button>
            <Button color="secondary" className={classes.button} onClick={() => uiState.mode = AuthMode.Signup}>
                Need An Account? Sign Up Here
            </Button>
        </Paper >
    )
}))

export default SignUpView;
