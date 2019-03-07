import { observable } from 'mobx';
import snakecaseKeys from 'snakecase-keys';

import { navigate } from './router';
import uiState, { setSnackBar } from './ui';
import { postRest, UnauthorizedError } from '../client';

const MAX_PASSWORD_LENGTH = 1000;
const MIN_PASSWORD_LENGTH = 7;
const SPECIAL_CHARACTERS = ['!', '@', '#', '$', '%', '^', '&', '*', '?'];
export class SignupFormValidationError extends Error {}

export function checkPasswordInput(password: string): string {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new SignupFormValidationError(
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
        );
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        throw new SignupFormValidationError(
            `Password must be less than ${MAX_PASSWORD_LENGTH} characters long`
        );
    }
    const specialCharacterPresent = SPECIAL_CHARACTERS.reduce((acc, curr) => {
        if (acc) {
            return acc;
        }
        return password.indexOf(curr) !== -1;
    }, false);
    if (!specialCharacterPresent) {
        throw new SignupFormValidationError(
            `Password must contain one special character from: ${JSON.stringify(
                SPECIAL_CHARACTERS
            )}`
        );
    }
    return password;
}

export function checkEmailInput(email: string): string {
    if (email.indexOf('@') === -1) {
        throw new SignupFormValidationError('Invalid syntax for email');
    }
    return email;
}

export async function logInUserGoogleOAuth(response) {
    const { profileObj, accessToken } = response;
    const { email } = profileObj;
    if (process.env.CLIENT_ENV === 'staging' || process.env.CLIENT_ENV === 'production') {
        try {
            await postRest(`/auth/check_whitelist`, { email });
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                setSnackBar(
                    'error',
                    `User has not been whitelisted, contact product-support@sidewalklabs.com`
                );
            } else {
                throw error;
            }
        }
    }

    const { status, statusText } = await fetch(`/auth/google/token`, {
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'access-token': `${accessToken}`
        }
    });
    // const url = `https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`;
    // try {
    //     const response = await fetch(url, {
    //         headers: {
    //             'Content-type': 'application/x-www-form-urlencoded'
    //         }
    //     });
    //     if (response.status !== 200) {
    //         console.error(
    //             `[email ${email}][accessToken: ${accessToken}] Unable to sign user out of oauth, ${
    //                 response.status
    //             }`
    //         );
    //     }
    // } catch (error) {
    //     console.error(`[url: ${url}] ${error}`);
    // }

    if (status === 200) {
        navigate('/studies');
    } else {
        console.error(statusText);
        setSnackBar('error', `Unable to Sign In ${statusText}`);
    }
}

export async function signUpUser() {
    const { password, passwordConfirmation, email } = signUpState;
    if (password !== passwordConfirmation) {
        signUpState.passwordConfirmationErrorMessage = 'Passwords must match';
        setSnackBar('error', 'Passwords must match');
        return;
    }
    try {
        checkEmailInput(email);
        checkPasswordInput(password);
    } catch (error) {
        if (error instanceof SignupFormValidationError) {
            setSnackBar('error', error.message);
        }
        return;
    }
    if (process.env.CLIENT_ENV === 'staging' || process.env.CLIENT_ENV === 'production') {
        try {
            await postRest(`/auth/check_whitelist`, { email });
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                setSnackBar(
                    'error',
                    `User has not been whitelisted, contact product-support@sidewalklabs.com`
                );
            } else {
                throw error;
            }
            return;
        }
    }
    try {
        await postRest(`/auth/signup`, { password, email });
        navigate('/studies');
    } catch (error) {
        setSnackBar('error', `Unable to sign sign ${error}`);
    } finally {
        resetSignupState();
    }
}

export function resetSignupState() {
    signUpState.email = '';
    signUpState.password = '';
}

interface SignUpState {
    email: string;
    password: string;
    passwordConfirmation: string;
    emailErrorMessage: string;
    passwordErrorMessage: string;
    passwordConfirmationErrorMessage: string;
}

const signUpState = observable({
    email: '',
    password: '',
    passwordConfirmation: '',
    emailErrorMessage: '',
    passwordErrorMessage: '',
    passwordConfirmationErrorMessage: ''
});

export default signUpState;
