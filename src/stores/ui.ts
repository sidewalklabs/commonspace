import { observable, autorun } from 'mobx';

interface UiState {
    drawerOpen: boolean;
}

const uiState = observable({
    drawerOpen: true
});

autorun(() => console.log('change: ', uiState.drawerOpen));

export default uiState;
