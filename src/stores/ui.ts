import { observable } from 'mobx';

interface AvailableLocation {
    locationId: string;
    name: string;
}

export type AvailableModals =
    | 'studyFields'
    | 'study'
    | 'deleteStudy'
    | 'surveyors'
    | 'surveys'
    | 'error'
    | 'map'
    | null;
type AvailableSnackbarType = 'success' | 'error' | null;

export interface SnackBar {
    snackBarType: AvailableSnackbarType;
    snackBarText: string;
}

export interface UiState {
    availableLocations: AvailableLocation[];
    currentStudyIsNew: boolean;
    modalStack: AvailableModals[];
    snackBar: SnackBar;
}

export function setSnackBar(snackBarType: AvailableSnackbarType, snackBarText: string) {
    uiState.snackBar = {
        snackBarType,
        snackBarText
    };
}

export function closeModalIfVisible(modal: AvailableModals) {
    const visibleModal = uiState.modalStack.slice(-1)[0];
    if (visibleModal === modal) {
        uiState.modalStack.pop();
    }
}

const uiState: UiState = observable({
    availableLocations: [],
    currentStudyIsNew: false,
    modalStack: [],
    snackBar: {
        snackBarType: null,
        snackBarText: ''
    }
});

export default uiState;
