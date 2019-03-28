import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '../components/AppBar';

import { observer } from 'mobx-react';

const styles = theme => ({
    content: {
        width: 'auto',
        margin: 'auto',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit *
            3}px`,
        [theme.breakpoints.up('md')]: {
            width: theme.breakpoints.values.md
        }
    }
});

// @ts-ignore
const PageNotFoundView = withStyles(styles)(
    observer((props: WithStyles) => {
        const { classes } = props;
        return (
            <>
                <AppBar />
                <div className={classes.content}>
                    <Typography variant="headline" gutterBottom>
                        Oops! We can’t find the page you were looking for!
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Error Code: 404
                    </Typography>
                </div>
            </>
        );
    })
);

export default PageNotFoundView;
