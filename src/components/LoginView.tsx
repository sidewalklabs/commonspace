import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { observer } from 'mobx-react';

import { navigate } from '../stores/router';
import uiState, { AuthMode } from '../stores/ui'
import logInState, { logInUser } from '../stores/login'

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
    button: {
        justifyContent: 'flex-end',
        alignContent: 'flex-end'
    },
    logInButton: {
        marinTop: '300px',
        width: '100%'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '100%'
    }
});

// @ts-ignore
const LogInView = withStyles(styles)(observer((props: WithStyles) => {
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
            <Button className={classes.logInButton} variant="contained" color="primary" onClick={logInUser}>
                Log In
            </Button>
            <Button color="secondary" className={classes.button} onClick={() => navigate("/signup")}>
                Need An Account? Sign Up Here
            </Button>
        </Paper >
    )
}))

export default LogInView;
