import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const fetch = require('node-fetch');

admin.initializeApp();

const db = admin.firestore();

const fetchParams: RequestInit = {
  //mode: "sam", // no-cors, cors, *same-origin
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'same-origin', // include, same-origin, *omit
  redirect: 'follow',
  referrer: 'no-referrer'
};


exports.addNewUserToDatabase = functions.auth.user().onCreate(async (user) => {
  const { email } = user;
  const saveNewUserUrl = `https://${functions.config().gcp.cloud_functions_host}/saveNewUser`
  const body = JSON.stringify({email});
  const params = {
    ...fetchParams,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    body
  };
    try {
      // https://firebase.google.com/docs/functions/config-env
      const gcfResponse = await fetch(saveNewUserUrl, params);
      const {user_id: userId } = await gcfResponse.json();

      try {
        const docRef = db.collection('users').doc(user.uid);
        await docRef.set({uid: user.uid, email, postgresId: userId});
      } catch (error) {
        console.error(`[userId ${userId}] [firebaseUser ${user}] ${error}`);
      }
    } catch (error) {
      console.error(`[url ${saveNewUserUrl}][values ${body}] ${error}`);
    }
})
