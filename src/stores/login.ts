import firebase from 'firebase/app';
import { observable, toJS } from 'mobx';

import router, { navigate } from './router';
import { setSnackBar } from './ui';
import { postRest, GenericHttpError, UnauthorizedError, ForbiddenResourceError } from '../client';

// todo: this state now requires configuration of your firebase app so it can handle login
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);

export async function resendVerificationEmail() {
    const { email } = loginState;
    try {
        await postRest('/auth/resend_verification', { email });
    } catch (error) {
        if (error instanceof GenericHttpError && error.errorMessage) {
            setSnackBar('error', error.errorMessage);
            resetLoginState();
        }
    }
    setSnackBar('success', `Verification email sent to ${email}`);
}

export async function logInUser() {
    const { password, email } = loginState;
    const data = {
        password,
        email
    };

    try {
        if (process.env.CLIENT_ENV === 'staging' || process.env.CLIENT_ENV === 'production') {
            try {
                await postRest(`/auth/check_whitelist`, { email });
            } catch (error) {
                if (error instanceof UnauthorizedError) {
                    setSnackBar(
                        'error',
                        'User has not been whitelisted, contact commonspace@sidewalklabs.com'
                    );
                } else {
                    throw error;
                }
                return;
            }
        }
        // once firebase returns, have it do a callback to switch out firebase token with jwt from the server
        if (router.uri == 'roxanne') {
            console.log(toJS(router));
        }
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`${errorCode}: ${errorMessage}`)
            setSnackBar('error', `Unable to log in, are email and password correct?`);
            resetLoginState();
            // ...
          });
        await postRest(`/auth/login`, { password, email });
        loginState.resendVerificationButtonIsShowing = false;
        resetLoginState();
        navigate('/studies');
    } catch (error) {
        if (error instanceof GenericHttpError && error.errorMessage) {
            setSnackBar('error', error.errorMessage);
            resetLoginState();
        } else if (error instanceof ForbiddenResourceError) {
            loginState.resendVerificationButtonIsShowing = true;
            setSnackBar(
                'error',
                'Email is not verified, must click on verification link from email'
            );
        } else {
            setSnackBar('error', `Unable to log in, are email and password correct?`);
            resetLoginState();
        }
    }
}

export function resetLoginState() {
    loginState.email = '';
    loginState.password = '';
}

export interface LogInState {
    email: string;
    password: string;
    emailErrorMessage: string;
    passwordErrorMessage: string;
    resendVerificationButtonIsShowing: boolean;
}

const loginState: LogInState = observable({
    email: '',
    password: '',
    emailErrorMessage: '',
    passwordErrorMessage: '',
    resendVerificationButtonIsShowing: false
});

export default loginState;
