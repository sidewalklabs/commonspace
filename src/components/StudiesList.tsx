import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import { observer } from 'mobx-react';

import applicationState, { selectNewStudy } from '../stores/applicationState';

export default observer((props: any & WithStyles) => {
    const { classes } = props;
    const listItems = Object.values(applicationState.studies).map(study => {
        return (
            <ListItem button onClick={async () => await selectNewStudy(study)}>
                <ListItemText primary={study.title} secondary={study.authorName} />
            </ListItem>
        );
    });
    return <div>{listItems}</div>;
});
