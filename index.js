import { init } from 'main';

const apiKey = 'AIzaSyD_6-qVGk9CiFyhv6wmGp-PWb1b8-sCytc';

const config = {
    apiKey: apiKey,
    authDomain: "gehl-921be.firebaseapp.com",
    databaseURL: "https://gehl-921be.firebaseio.com",
    projectId: "gehl-921be",
};

firebase.initializeApp(config);

const database = firebase.database();
const firestore = firebase.firestore();
const auth = firebase.auth();

const ui = new firebaseui.auth.AuthUI(auth);
console.log(ui);

ui.start('#firebaseui-auth-container', {
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      console.log('sign in is a succes: ', authResult);
    }
  },
  signInOptions: [
    // List of OAuth providers supported.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  signInSuccessUrl: '/'
});

auth.onAuthStateChanged(function(user) {
  if (user) {
    console.log('user: ', user);
  }
});

const ThorneCliffParkStudy = {
  
}


//creator_id : '',
    // protocol_id: '',
    // title?: '',
    // project?: '',
    // project_phase?: '',
    // start_date?: '',
    // end_date?: ''
    // scale?: '',
    // areas?: '',
    // notes?:
function saveStudy(db, study) {
  db.collection('study').add({
   ...study 
  }).then(function(docRef) {
    study_id = docRef.id;
    console.log("Document written with ID: ", docRef.id);
  })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });

}

function saveUser(db, user) {
  db.collection('user').add({
   ...user 
  })
}

console.log('we are done: ', init());
