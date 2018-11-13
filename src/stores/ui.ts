import { observable, autorun } from 'mobx';

import initmap from '../map';


interface AvailableLocation {
    locationId: string;
    name: string;
}

const bcAvailableLocations = new BroadcastChannel('available_locations');
bcAvailableLocations.onmessage = ({data}) => {
    uiState.availableLocations = data;
}

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
    login: boolean;
    mode: AuthMode;
}

const uiState = observable({
    addSurveyorModalIsOpen: false,
    addSurveyorModalText: '',
    availableLocations: [],
    currentStudyIsNew: false,
    drawerOpen: true,
    mode: AuthMode.Signup,
    login: false
});

autorun(() => {
    console.log(uiState.addSurveyorModalIsOpen);
});

export default uiState;
