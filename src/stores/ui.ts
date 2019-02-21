import { observable } from 'mobx';

interface AvailableLocation {
    locationId: string;
    name: string;
}

export type AvailableModals =
    | 'studyFields'
    | 'study'
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
