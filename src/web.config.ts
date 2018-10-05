import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';

const apiKey = 'AIzaSyD_6-qVGk9CiFyhv6wmGp-PWb1b8-sCytc';

const config = {
    apiKey: apiKey,
    authDomain: 'gehl-921be.firebaseapp.com',
    databaseURL: 'https://gehl-921be.firebaseio.com',
    projectId: 'gehl-921be'
};

firebase.initializeApp(config);

export const FIRESTORE = firebase.firestore();
FIRESTORE.settings({ timestampsInSnapshots: true });
export const AUTH = firebase.auth();
export const AUTH_UI = new firebaseui.auth.AuthUI(AUTH);
