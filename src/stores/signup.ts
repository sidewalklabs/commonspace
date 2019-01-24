import { observable } from 'mobx';
import snakecaseKeys from 'snakecase-keys';

import { navigate } from './router';
import uiState, { setSnackBar } from './ui';

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
