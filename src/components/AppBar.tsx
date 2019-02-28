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
import AuthState from '../stores/auth';
import { navigate } from '../stores/router';
import { postRest } from '../client';

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
    (await postRest('/auth/logout', {})) as {};
    mainState.anchorElement = null;
    AuthState.isAuth = false;
    navigate('/login');
}

async function handleResetPassword() {
    (await postRest('/auth/logout', {})) as {};
    AuthState.isAuth = false;
    mainState.anchorElement = null;
    navigate('/reset');
}

interface MainState {
    anchorElement: HTMLElement | null;
}

const mainState: MainState = observable({
    anchorElement: null
});

async function downloadUserData() {
    const response = await fetch('/api/studies/download')
    const url = window.URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data.json');
    document.body.appendChild(link);
    link.click();
}

const Main = observer((props: any & WithStyles) => {
    const { classes } = props;
    const { anchorElement } = mainState;

    return (
        <AppBar className={classes.appBar} position="sticky" color="default">
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
                <IconButton
                    color="inherit"
                    aria-label="Open Menu"
                    onClick={e => (mainState.anchorElement = e.currentTarget)}
                    className={classes.menuIcon}
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorElement}
                    open={!!anchorElement}
                    onClose={() => (mainState.anchorElement = null)}
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
export default withStyles(styles)(Main);
