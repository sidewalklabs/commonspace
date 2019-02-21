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

export interface TermsViewProps {
    webview?: boolean;
}

const TermsView = observer((props: TermsViewProps & WithStyles) => {
    const { classes, webview } = props;
    return (
        <>
            {!webview && <AppBar />}
            <div className={classes.content}>
                <Typography variant="headline" gutterBottom>
                    ​Terms & Conditions
                </Typography>
            </div>
        </>
    );
});

// @ts-ignore
export default withStyles(styles)(TermsView);
