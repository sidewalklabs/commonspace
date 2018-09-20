import * as firebase from 'firebase';
import * as sideEffectThatDisappears from 'firebase/firestore'; // important side effects, go oo-programming
let firestoreLib;

const firebaseConfig = {
  apiKey: 'AIzaSyD_6-qVGk9CiFyhv6wmGp-PWb1b8-sCytc',
  authDomain: 'gehl-921be.firebaseapp.com',
  databaseURL: 'https://gehl-921be.firebaseio.com',
  projectId: 'gehl-921be',
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
firestore.settings({ timestampsInSnapshots: true });

export default firebase;
