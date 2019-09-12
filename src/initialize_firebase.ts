import firebase from 'firebase';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID
};

let initialized = false;

export default function() {
    if (!initialized) {
        firebase.initializeApp(firebaseConfig);
        initialized = true;
    }
}
