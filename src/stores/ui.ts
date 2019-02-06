import { autorun, observable, computed, toJS } from 'mobx';


const DEFAULT_LATITUDE = 40.730819
const DEFAULT_LONGITUDE = -73.997461

interface AvailableLocation {
    locationId: string;
    name: string;
}

export type AvailableModals = 'studyFields' | 'study' | 'surveyors' | 'surveys' | 'error' | 'map' | null
type AvailableSnackbarType = 'success' | 'error' | null

export interface SnackBar {
    snackBarType: AvailableSnackbarType;
    snackBarText: string;
}

export interface UiState {
    availableLocations: AvailableLocation[];
    currentStudyIsNew: boolean;
    modalStack: AvailableModals[]
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
    modalStack: [],
    snackBar: {
        snackBarType: null,
        snackBarText: ''
    }
});

export default uiState;
