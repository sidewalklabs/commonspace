import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import { observer } from 'mobx-react';
import resetState, { resetPasswordRequest } from '../stores/reset'

import { navigate } from '../stores/router'

const styles = theme => ({
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


interface ResetProps {
    email: string;
}

const ResetView = observer((props: ResetProps & WithStyles) => {
    const { classes, email } = props;
    return (
        <Paper className={classes.root}>
            <TextField
                id="login-email"
                label="Email"
                onChange={e => resetState.email = e.target.value}
                className={classes.textField} />
            <Button className={classes.logInButton} variant="contained" color="primary" onClick={async () => await resetPasswordRequest()}>
                Send
            </Button>
            <Button color="secondary" className={classes.button} onClick={() => navigate("/login")}>
                Back to Log In
            </Button>
        </Paper >
    )
})

// @ts-ignore
export default withStyles(styles)(ResetView);
