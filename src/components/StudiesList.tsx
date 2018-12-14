import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import { observer } from 'mobx-react';

import { selectNewStudy } from '../stores/applicationState';
import uiState from '../stores/ui';

const styles = theme => ({

});

async function transitionToViewStudy(study) {
    uiState.currentStudyIsNew = false;
    await selectNewStudy(study)
}

export interface StudiesListProps {
    studies: { [key: string]: Study };
}

export default withStyles(styles)(observer((props: StudiesListProps & WithStyles) => {
    const { classes, studies } = props;
    const listItems = Object.values(studies).map(study => {
        const { studyId, title } = study;
        return (
            <ListItem button key={studyId} onClick={async () => await transitionToViewStudy(study)}>
                <ListItemText primary={title} />
            </ListItem>
        );
    });
    return <div>{listItems}</div>;
}));
