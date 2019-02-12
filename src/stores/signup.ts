import { observable } from 'mobx';
import snakecaseKeys from 'snakecase-keys';

import authState from './auth';
import { navigate } from './router';
import uiState, { setSnackBar } from './ui';


const MAX_PASSWORD_LENGTH = 1000
const MIN_PASSWORD_LENGTH = 7
const SPECIAL_CHARACTERS = ['!', '@', '#', '$', '%', '^', '&', '*', '?']
export class SignupFormValidationError extends Error {}

export function checkPasswordInput(password: string): string {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new SignupFormValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        throw new SignupFormValidationError(`Password must be less than ${MAX_PASSWORD_LENGTH} characters long`);
    }
    const specialCharacterPresent = SPECIAL_CHARACTERS.reduce((acc, curr) => {
        if (acc) {
            return acc;
        }
        return password.indexOf(curr) !== -1;
    }, false);
    if (!specialCharacterPresent) {
        throw new SignupFormValidationError(`Password must contain one special character from: ${JSON.stringify(SPECIAL_CHARACTERS)}`);
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

    const {status, statusText} = await fetch('https://commons-staging.sidewalklabs.com/auth/google/token', {
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'access-token': `${accessToken}`,
        },
    });

    if (status === 200) {
        authState.isAuth = true;
        navigate('/studies');
    } else {
        console.error(statusText);
        setSnackBar('error', `Unable to Sign In ${statusText}`);
    }
}

export async function signUpUser() {
    const { name, password, passwordConfirmation, email} = signUpState;
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
    const data = {
        password,
        email,
        name
    }
    const {status, statusText} = await fetch(`/auth/signup`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(snakecaseKeys(data)), // body data type must match "Content-Type" header
    })
    if (status === 200) {
        authState.isAuth = true;
        navigate('/studies');
    } else {
        console.error(statusText);
        setSnackBar('error', `Unable to Sign In ${statusText}`);
    }
}

interface SignUpState {
    email: string;
    name: string;
    password: string;
    passwordConfirmation: string;
    emailErrorMessage: string;
    passwordErrorMessage: string;
    passwordConfirmationErrorMessage: string;
}


const signUpState = observable({
    email: '',
    name: '',
    password: '',
    passwordConfirmation: '',
    emailErrorMessage: '',
    passwordErrorMessage: '',
    passwordConfirmationErrorMessage: ''
})

export default signUpState;
