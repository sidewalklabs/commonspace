import { observable, autorun, toJS } from 'mobx';

interface AvailableLocation {
    locationId: string;
    name: string;
}

export type AvailableModals = 'studyFields' | 'study' | 'surveyors' | 'surveys' | 'error' | null
type AvailableSnackbarType = 'success' | 'error' | null

export interface SnackBar {
        snackBarType: AvailableSnackbarType;
        snackBarText: string;
}

export interface UiState {
    availableLocations: AvailableLocation[]; 
    currentStudyIsNew: boolean;
    visibleModal: AvailableModals;
    snackBar: SnackBar;
}

export function setSnackBar(snackBarType: AvailableSnackbarType, snackBarText: string) {
    uiState.snackBar = {
        snackBarType,
        snackBarText
    }
}

const uiState: UiState = observable({
    availableLocations: [],
    currentStudyIsNew: false,
    visibleModal: null,
    snackBar: {
        snackBarType: null,
        snackBarText: ''
    }
});

autorun(() => {
    console.log(uiState.snackBar.snackBarText);
});

export default uiState;
