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
let studies;

const ui = new firebaseui.auth.AuthUI(auth);
let userId;

ui.start('#firebaseui-auth-container', {
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      console.log('sign in is a succes: ', authResult);
      getAvailableStudies();
      const elements = document.getElementsByClassName('container')
      Array.prototype.forEach.call(elements, element => {
         element.hidden = false;
      });
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
    getAvailableStudies();
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
  firestore.collection('user').add({
    ...user
  })
}

function getAvailableStudies() {
  if (userId) {
    firestore.collection('study')
      .where("firebase_uid", "==", userId)
      .get()
      .then(function(querySnapshot) {
        studies = []
        querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          const data = doc.data();
          console.log(doc.id, " => ", data);
          studies.push({
            studyId: doc.id,
            title: data.title
          });
          const selectElement = document.getElementById('study-select');
          while (selectElement.firstChild) {
            selectElement.removeChild(selectElement.firstChild)
          }
          studies.forEach((study) => {
            const newOption = document.createElement('option');
            newOption.value = study.studyId;
            newOption.innerHTML = study.title;
            selectElement.appendChild(newOption);
          });
        });
      });
  }
}


window.addEventListener("load", function () {
  document.getElementById("new-study-form").addEventListener('submit', function (event) {
    event.preventDefault();
    firebase.auth().currentUser.getIdToken(true).then((token) => {
      const newStudy = {
        title: document.getElementById('study-title').value,
        protocolVersion: document.getElementById('protocol-version-selection').value,
        firebase_uid: userId,
        token
      };
      console.log('new study being sent to firestore: ', JSON.stringify(newStudy));
      saveStudy(newStudy);
    });
  });

  document.getElementById("add-surveyor").addEventListener('submit', function (event) {
    event.preventDefault();
    const study = document.getElementById("new-surveyor").value;
    console.log('study selected: ', study);
    firestore.collection.doc(study).get(function(doc) {
      if (doc.exists) {
        console.log(doc.data())
      }
    });
    //const email = document.getElementById("surveyor-email").value
    // update study information by adding this surveyor to the list of authorized surveyors

  });

});
