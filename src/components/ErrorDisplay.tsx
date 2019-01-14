import React, { Fragment } from 'react';

import { get, set, toJS } from 'mobx';
import { observer } from 'mobx-react';

import classNames from 'classnames';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';

import Typography from '@material-ui/core/Typography';

import uiState, { SnackBar } from '../stores/ui';

const styles = theme => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
        marginRight: theme.spacing.unit * 2
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    }
})

interface ErrorDisplayProps {
    snackBar: SnackBar;
}


const variantIcon = {
    success: CheckCircleIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

function MySnackbarContent(props) {
    const { classes, className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={classNames(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Icon className={classNames(classes.icon, classes.iconVariant)} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={classes.close}
                    onClick={onClose}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
}

// @ts-ignore
const MySnackbarContentWrapper = withStyles(styles)(MySnackbarContent);


const ErrorDisplay = observer((props: ErrorDisplayProps & WithStyles) => {
    const { classes, snackBar } = props;
    const { snackBarType, snackBarText } = snackBar;
    return (
        <Fragment>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={snackBarType === 'success'}
                autoHideDuration={6000}
                onClose={() => {
                    uiState.snackBar.snackBarText = '';
                    uiState.snackBar.snackBarType = null;
                }}>
                <MySnackbarContentWrapper
                    variant='success'
                    className={classes.margin}
                    message={snackBarText}
                />
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={snackBarType === 'error'}
                autoHideDuration={6000}
                onClose={() => {
                    uiState.snackBar.snackBarText = '';
                    uiState.snackBar.snackBarType = null;
                }}>
                <MySnackbarContentWrapper
                    variant='error'
                    className={classes.margin}
                    message={snackBarText}
                />
            </Snackbar>
        </Fragment>
    )
});

// @ts-ignore
export default withStyles(styles)(ErrorDisplay);
