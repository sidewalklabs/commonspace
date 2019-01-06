import { observable, autorun, toJS } from 'mobx';

interface AvailableLocation {
    locationId: string;
    name: string;
}

export function visualizeNewStudy() {
    uiState.currentStudyIsNew = true;
    uiState.visibleModal = 'study';
}


export type AvailableModals = 'studyFields' | 'study' | 'surveyors' | 'surveys' | 'error' | null
type AvailableSnackbarType = 'success' | 'error' | null

interface UiState {
    availableLocations: AvailableLocation[]; 
    currentStudyIsNew: boolean;
    visibleModal: AvailableModals;
    snackBar: {
        snackbarType: AvailableSnackbarType;
        snackbarText: string;
    };
}

export function setSnackBar(snackbarType: AvailableSnackbarType, snackbarText: string) {
    uiState.snackBar = {
        snackbarType,
        snackbarText
    }
}


// TODO cascade setting of modal on setting errorText?
const uiState: UiState = observable({
    availableLocations: [],
    currentStudyIsNew: false,
    visibleModal: null,
    snackBar: {
        snackbarType: null,
        snackbarText: '',
    }
});

autorun(() => {
    console.log('');
});

export default uiState;
