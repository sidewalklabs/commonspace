import { observable, autorun, toJS } from 'mobx';

interface AvailableLocation {
    locationId: string;
    name: string;
}

export function visualizeNewStudy() {
    uiState.currentStudyIsNew = true;
    uiState.visibleModal = 'study';
}

export type AvailableModals = 'study' | 'surveyors' | 'surveys' | null

interface UiState {
    availableLocations: AvailableLocation[]; 
    currentStudyIsNew: boolean;
    visibleModal: AvailableModals;
}

const uiState: UiState = observable({
    availableLocations: [],
    currentStudyIsNew: false,
    visibleModal: null
});

autorun(() => {
    console.log('');
});

export default uiState;
