import { observable, autorun, toJS } from 'mobx';

interface AvailableLocation {
    locationId: string;
    name: string;
}

export function visualizeNewStudy() {
    uiState.currentStudyIsNew = true;
    uiState.visibleModal = 'study';
}

export enum AuthMode {
    Login, Signup, Authorized
}

export type AvailableModals = 'study' | 'surveyors' | 'shifts' | null

interface UiState {
    availableLocations: AvailableLocation[]; 
    currentStudyIsNew: boolean;
    visibleModal: AvailableModals;
    mode: AuthMode;
}

const uiState = observable({
    availableLocations: [],
    currentStudyIsNew: false,
    visibleModal: null,
    mode: AuthMode.Signup
});

autorun(() => {
    console.log(toJS(uiState.visibleModal));
});

export default uiState;
