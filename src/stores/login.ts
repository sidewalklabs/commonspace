import { observable, toJS } from 'mobx';

import firebase from 'firebase/app';
import router, { navigate } from './router';
import { setSnackBar } from './ui';
import { postRest, GenericHttpError, UnauthorizedError, ForbiddenResourceError } from '../client';

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
    try {
        if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
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
        // // once firebase returns, have it do a callback to switch out firebase token with jwt from the server
        // if (router.uri == 'secretLogin') {
        //     console.log(toJS(router));
        // }
        // await firebase
        //     .auth()
        //     .signInWithEmailAndPassword(email, password)
        //     .catch(function(error) {
        //         // Handle Errors here.
        //         const { code, message } = error;
        //         console.log(`${code}: ${message}`);
        //         setSnackBar('error', `Unable to log in, are email and password correct?`);
        //         resetLoginState();
        //     });
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
