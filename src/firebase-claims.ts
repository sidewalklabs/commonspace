import { readFileSync } from 'fs';

import * as admin from 'firebase-admin';


export async function addClaimToUser(credentialFile: string, claim: string, uid: string) {
    const serviceAccountKey = JSON.parse(readFileSync(credentialFile, 'utf-8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) })
    const claimToAdd = {};
    claimToAdd[claim] = true;
    const res = await admin.auth().setCustomUserClaims(uid, claimToAdd);
    console.log(`set claim ${claim} for uid: ${uid}`);
}

addClaimToUser('gehl-921be-firebase-adminsdk-46n9l-0d6437a6d4.json', 'studyCreator', 'EeGkw2WJX2PVbhxuojhFflWEuKi2')
