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
let myUserId;

ui.start('#firebaseui-auth-container', {
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      console.log('sign in is a succes: ', authResult);
      document.getElementById('new-study').hidden = false;
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
    userId = user.uid;
    console.log('user: ', user);
  }
});

function saveStudy(study) {
  firestore.collection('study').add({
    ...study
  }).then(function(docRef) {
    study_id = docRef.id;
    console.log("Document written with ID: ", docRef.id);
  }).catch(function(error) {
    console.error("Error adding document: ", error);
  });
}

function saveUser(db, user) {
  db.collection('user').add({
    ...user
  })
}


window.addEventListener("load", function () {
  document.getElementById("new-study-form").addEventListener('submit', function (event) {
    event.preventDefault();
    const newStudy = {
      title: document.getElementById('study-title').value,
      protocolVersion: document.getElementById('protocol-version-selection').value
    };
    console.log(JSON.stringify(newStudy));
    saveStudy(newStudy);
  });
});
