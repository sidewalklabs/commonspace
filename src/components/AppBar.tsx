import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { navigate } from '../stores/router';
import { logoutUser } from '../client';
import { resetApplicationState } from '../stores/applicationState';
import { resetLoginState } from '../stores/login';
import { resetSignupState } from '../stores/signup';

const styles = theme => ({
    toolbar: {
        color: 'inherit',
        backgroundColor: 'white'
    },
    title: {
        marginLeft: theme.spacing.unit,
        flexGrow: 1
    }
});

async function handleLogOut() {
    logoutUser();
    resetApplicationState();
    resetLoginState();
    resetSignupState();
    appBarState.anchorElement = null;
    navigate('/');
}

async function handleResetPassword() {
    logoutUser();
    resetApplicationState();
    resetLoginState();
    resetSignupState();
    appBarState.anchorElement = null;
    navigate('/reset');
}

interface AppBarState {
    anchorElement: HTMLElement | null;
}

const appBarState: AppBarState = observable({
    anchorElement: null
});

async function downloadUserData() {
    const response = await fetch('/api/studies/download');
    const url = window.URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data.json');
    document.body.appendChild(link);
    link.click();
}

// This is a stopgap until client knows about auth state reliably
interface AppBarProps {
    rightHeaderType?: 'login' | 'account-menu' | 'none';
}

const CustomAppBar = observer((props: AppBarProps & WithStyles) => {
    const { classes, rightHeaderType } = props;
    const { anchorElement } = appBarState;

    return (
        <AppBar position="sticky" color="default">
            <Toolbar className={classes.toolbar}>
                <IconButton
                    color="inherit"
                    aria-label="CommonSpace Home"
                    onClick={e => {
                        navigate('/');
                    }}
                >
                    <Avatar alt="CommonSpace Icon" src="/assets/images/AppIconSVG.svg" />
                </IconButton>
                <Typography
                    component="h1"
                    variant="h6"
                    color="inherit"
                    noWrap
                    className={classes.title}
                >
                    CommonSpace
                </Typography>
                {rightHeaderType === 'login' && <Button href="/login">Log In</Button>}
                {rightHeaderType === 'account-menu' && (
                    <IconButton
                        color="inherit"
                        aria-label="Open Menu"
                        onClick={e => (appBarState.anchorElement = e.currentTarget)}
                        className={classes.menuIcon}
                    >
                        <MoreVertIcon />
                    </IconButton>
                )}
                <Menu
                    id="simple-menu"
                    anchorEl={anchorElement}
                    open={!!anchorElement}
                    onClose={() => (appBarState.anchorElement = null)}
                >
                    <MenuItem onClick={handleResetPassword}>Reset Password</MenuItem>
                    <MenuItem onClick={downloadUserData}>Download My Data</MenuItem>
                    <MenuItem onClick={handleLogOut}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
});

// @ts-ignore
export default withStyles(styles)(CustomAppBar);
