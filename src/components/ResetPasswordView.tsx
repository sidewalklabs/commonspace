import React from 'react';

import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { navigate } from '../stores/router';
import { setSnackBar } from '../stores/ui';


interface ResetPasswordProps {
    token: string;
}

const fetchParams: RequestInit = {
    //mode: "sam", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    redirect: 'follow',
    referrer: 'no-referrer'
}

const state = observable({
    password: '',
    verifyPassword: ''
})

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
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '100%'
    }
})

async function ResetPasswordRequest(token: string) {
    const { password } = state;
    const body = { password }
    const response = await fetch(`/auth/reset_password?token=${token}`, {
        ...fetchParams,
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
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
            <TextField
                id="password"
                label="New Password"
                onChange={e => state.password = e.target.value}
                className={classes.textField} />
            <TextField
                id="verify-password"
                label="Verify Password"
                onChange={e => state.verifyPassword = e.target.value}
                className={classes.textField} />
            <Button className={classes.button} variant="contained" color="primary" onClick={async () => await ResetPasswordRequest(token)}>
                Reset
            </Button>
        </Paper>
    )
})

// @ts-ignore
export default withStyles(styles)(ResetPassword);
