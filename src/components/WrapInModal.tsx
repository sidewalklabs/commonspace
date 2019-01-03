import React from 'react';
import { observer } from 'mobx-react';
import Modal from '@material-ui/core/Modal';
import { withStyles, WithStyles } from '@material-ui/core/styles';

import uiState from '../stores/ui';

const styles = theme => ({
    paper: {
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    }
})

// @ts-ignore
const WrapInModal = withStyles(styles)(observer(props => {
    const { classes, children, modalName, visibleModal, onClose = () => uiState.visibleModal = null } = props;
    return (
        <Modal
            open={visibleModal === modalName}
            onClose={onClose}
        >
            <div className={classes.paper}>
                {children}
            </div>
        </Modal>
    )
}));

export default WrapInModal;
