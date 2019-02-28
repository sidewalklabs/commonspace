import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
// import { GoogleLogin } from 'react-google-login';

import { observer } from 'mobx-react';

// import { logInUserGoogleOAuth } from '../stores/signup';
import { navigate } from '../stores/router';
import { setSnackBar } from '../stores/ui';

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

const responseGoogleFailure = response => {
    console.error(response);
    setSnackBar('error', 'Unable to authenticate with Google OAuth');
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
                        Welcome to CommonSpace
                    </Typography>
                    <Typography variant="body1" align="center">
                        Study the places you love
                    </Typography>
                    {/* { Take out Google Login until our android and ios apps can support it } */}
                    {/* <GoogleLogin
                        clientId={process.env.GOOGLE_AUTH_CLIENT_ID}
                        onSuccess={logInUserGoogleOAuth}
                        onFailure={responseGoogleFailure}
                        render={renderProps => (
                            <Fab
                                variant="extended"
                                onClick={renderProps.onClick}
                                classes={{
                                    root: classes.button,
                                    label: classes.buttonLabel
                                }}
                            >
                                Continue with Google
                            </Fab>
                        )}
                    />
                    <Typography variant="caption" align="center">
                        OR
                    </Typography> */}
                    <Fab
                        variant="extended"
                        onClick={() => navigate('/loginWithEmail')}
                        classes={{
                            root: classes.button,
                            label: classes.buttonLabel
                        }}
                    >
                        Continue with Email
                    </Fab>
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
