import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import { observer } from 'mobx-react';

import initializeFirebase from '../initialize_firebase';
import { navigate } from '../stores/router';
import { setSnackBar } from '../stores/ui';
import { postRest, ForbiddenResourceError, UnauthorizedError } from '../client';

const styles = theme => ({
    root: {
        width: 'auto',
        margin: 0,
        height: '100%',
        [theme.breakpoints.up(700 + theme.spacing.unit * 3 * 2)]: {
            width: 700,
            marginTop: theme.spacing.unit * 3,
            marginLeft: 'auto',
            marginRight: 'auto',
            height: 'auto'
        },
        display: 'flex',
        flex: '0 1 auto',
        alignItems: 'center',
        flexDirection: 'column',
        alignContent: 'center'
    },
    content: {
        padding: theme.spacing.unit * 3,
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center'
    },
    avatar: {
        marginBottom: theme.spacing.unit * 2
    },
    button: {
        margin: theme.spacing.unit * 3,
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'none'
    },
    buttonLabel: {
        textTransform: 'none'
    },
    oulinedButton: {
        border: `1px solid ${theme.palette.divider}`,
        margin: theme.spacing.unit * 3,
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'none'
    },
    footer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        padding: theme.spacing.unit * 3,
        backgroundColor: theme.palette.primary.main
    },
    footerCopy: {
        color: theme.palette.getContrastText(theme.palette.primary.main)
    }
});

const responseGoogleFailure = ({ error }) => {
    if (error === 'popup_closed_by_user') {
        return;
    }
    console.error(error);
    const errorMessage =
        error === 'idpiframe_initialization_failed'
            ? 'Google OAuth not available, contact commonspace@sidewalklabs.com'
            : 'Unable to authenticate with Google OAuth';
    setSnackBar('error', errorMessage);
};

initializeFirebase();

firebase.auth().onAuthStateChanged(async function(user) {
    const { email } = user;
    if (email) {
        try {
            await postRest(`/auth/check_whitelist`, { email });
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                setSnackBar(
                    'error',
                    'User has not been whitelisted, contact commonspace@sidewalklabs.com'
                );
                throw error;
            } else {
                console.error('unable to access whitelist from backend');
                throw error;
            }
            return;
        }
    }

    if (user && !user.emailVerified) {
        console.warn('user has not verfied with firebase');
        await user.sendEmailVerification();
        setSnackBar(
            'error',
            'Email is not verified, must click on verification link in sent email'
        );
        firebase.auth().signOut();
    } else if (user && user.emailVerified) {
        const firebaseJwt = await user.getIdToken();
        try {
            await postRest('/auth/firebase/token', { firebase_id_token: firebaseJwt });
            navigate('/studies');
            return;
        } catch (error) {
            if (error instanceof ForbiddenResourceError) {
                setSnackBar(
                    'error',
                    'Email is not verified, must click on verification link from email'
                );
            } else {
                setSnackBar(
                    'error',
                    'unable to login verified account, contact commonspace@sidewalklabs.com'
                );
                console.error(error);
            }
            firebase.auth().signOut();
            navigate('/login');
        }
    }
});

// https://github.com/firebase/firebaseui-web#configuration
const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
};

// @ts-ignore
const LoginView = withStyles(styles)(
    observer((props: WithStyles) => {
        const { classes } = props;
        return (
            <Paper className={classes.root}>
                <div className={classes.content}>
                    <Avatar
                        alt="Commons Icon"
                        src="/assets/images/AppIconSVG.svg"
                        className={classes.avatar}
                    />
                    <Typography variant="h6" align="center" gutterBottom>
                        Welcome to CommonSpace (Beta)
                    </Typography>
                    <Typography variant="caption" align="center">
                        If you are a beta tester, log in below.
                    </Typography>
                    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                    <Typography variant="caption" align="center" gutterBottom>
                        By continuing, you agree to CommonSpace <a href="/terms">terms</a> and{' '}
                        <a href="/privacy">privacy</a>
                    </Typography>
                </div>
                <div className={classes.footer}>
                    <Typography
                        variant="caption"
                        align="center"
                        classes={{ root: classes.footerCopy }}
                        gutterBottom
                    >
                        CommonSpace is an app for running Public Life Studies
                    </Typography>
                    <Fab
                        variant="extended"
                        color="secondary"
                        href="/about"
                        classes={{
                            root: classes.button,
                            label: classes.buttonLabel
                        }}
                        style={{ width: 'auto', marginBottom: 'auto' }}
                    >
                        Learn More
                    </Fab>
                </div>
            </Paper>
        );
    })
);

export default LoginView;
