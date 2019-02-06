import React from 'react';
import { observer } from 'mobx-react';
import Modal from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core/styles';

import uiState from '../stores/ui';

const styles = theme => ({
    paper: {
        position: 'absolute',
        width: '700px',
        maxHeight: '700px',
        overflow: "auto",
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing.unit * 4,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    }
})

// @ts-ignore
const WrapInModal = withStyles(styles)(observer(props => {
    const { classes, children, modalName, visibleModal, onClose = () => uiState.modalStack.pop() } = props;
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
