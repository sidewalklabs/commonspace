import { observable, autorun, toJS } from 'mobx';

interface AvailableLocation {
    locationId: string;
    name: string;
}

const bcAvailableLocations = new BroadcastChannel('new_zone');
bcAvailableLocations.onmessage = ({data}) => {
    uiState.availableLocations = [...uiState.availableLocations, data];
}

const availableZones = new BroadcastChannel('');

export function visualizeNewStudy() {
    uiState.currentStudyIsNew = true;
}

export enum AuthMode {
    Login, Signup, Authorized
}

interface UiState {
    addSurveyorModalIsOpen: boolean;
    addSurveyorModalText: string;
    availableLocations: AvailableLocation[]; 
    currentStudyIsNew: boolean;
    drawerOpen: boolean;
    mode: AuthMode;
}

const uiState = observable({
    addSurveyorModalIsOpen: false,
    addSurveyorModalText: '',
    availableLocations: [],
    currentStudyIsNew: false,
    drawerOpen: true,
    mode: AuthMode.Signup
});

autorun(() => {
    console.log(toJS(uiState.availableLocations));
});

export default uiState;
