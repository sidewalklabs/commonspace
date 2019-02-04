import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { GoogleLogin } from 'react-google-login';

import { observer } from 'mobx-react';

import { logInUserGoogleOAuth } from '../stores/signup'
import { navigate } from '../stores/router';
import { setSnackBar } from '../stores/ui';

const styles = theme => ({
  root: {
    width: '700px',
    display: 'flex',
    margin: theme.spacing.unit * 3,
    flex: '0 1 auto',
    alignItems: 'center',
    flexDirection: 'column',
    alignContent: 'center',
  },
  content: {
    padding: theme.spacing.unit * 3,
    flex: '0 1 auto',
    display: "flex",
    alignItems: 'center',
    flexDirection: 'column',
  },
  avatar: {
    marginBottom: theme.spacing.unit * 2,
  },
  button: {
    width: '400px',
    margin: theme.spacing.unit * 2,
    boxShadow: "none",
  },
  buttonLabel: {
    textTransform: 'none',
  },
  oulinedButton: {
    border: `1px solid ${theme.palette.divider}`,
    width: '400px',
    margin: theme.spacing.unit * 2,
    boxShadow: "none",
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: "stretch",
    padding: theme.spacing.unit * 3,
    backgroundColor: theme.palette.primary.main
  },
  footerCopy: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
  }
});

const responseGoogleFailure = (response) => {
  console.error(response);
  setSnackBar('error', 'Unable to authenticate with Google OAuth');
}

// @ts-ignore
const AuthLandingView = withStyles(styles)(observer((props: WithStyles) => {
  const { classes } = props;
  return (
    <Paper className={classes.root}>
      <div className={classes.content}>
        <Avatar alt="Commons Icon" src="/assets/images/CircleIcon.png" className={classes.avatar} />
        <Typography variant="title" gutterBottom>Welcome to CommonSpace</Typography>
        <Typography variant="body1">Study the places you love</Typography>
        <GoogleLogin
          clientId={process.env.GOOGLE_AUTH_CLIENT_ID}
          onSuccess={logInUserGoogleOAuth}
          onFailure={responseGoogleFailure}
          render={renderProps => (
            <Button variant="extendedFab" onClick={renderProps.onClick} classes={{
              root: classes.button,
              label: classes.buttonLabel
            }}>
              Continue with Google
          </Button>
          )}
        />
        <Typography variant="caption">OR</Typography>
        <Button variant="extendedFab" color='secondary' onClick={() => navigate("/login")} classes={{
          root: classes.oulinedButton,
          label: classes.buttonLabel
        }}>
          Continue with Email
      </Button>
        <Typography variant="caption" gutterBottom>By continuing, you agree to CommonSpace terms and privacy [INSERT LINK]</Typography>
      </div>
      <div className={classes.footer}>
        <Typography variant="caption" classes={{ root: classes.footerCopy }} gutterBottom>
          CommonSpace is an app for running Public Life Studies
        </Typography>
        <Button variant="extendedFab" color='secondary' onClick={() => window.open('https://sidewalklabs.github.io/gehl-prototype/')} classes={{
          root: classes.button,
          label: classes.buttonLabel
        }} style={{ width: 'auto', marginBottom: "auto" }}>
          Learn More
      </Button>
      </div>
    </Paper >
  )
}));

export default AuthLandingView;
