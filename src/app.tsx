import React from 'react';

import auth from 'firebase/auth';
import { render } from 'react-dom';
import Main from './main';

import { FIRESTORE, AUTH, AUTH_UI } from './web.config';

import applicationState, { getStudies } from './stores/applicationState';

AUTH.onAuthStateChanged(function(user) {
    if (user) {
        getStudies().then(studies => {
            render(<Main isOpen={true} />, document.getElementById('app'));
        });
    } else {
        AUTH_UI.start('#firebaseui-auth-container', {
            callbacks: {
                signInSuccessWithAuthResult: authResult => true
            },
            signInOptions: [
                // List of OAuth providers supported.
                auth.GoogleAuthProvider.PROVIDER_ID
            ],
            signInSuccessUrl: '/'
        });
    }
});
