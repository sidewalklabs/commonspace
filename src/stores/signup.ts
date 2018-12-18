import { observable } from 'mobx';
import snakecaseKeys from 'snakecase-keys';
import uuidv4 from 'uuid/v4';

import { init } from './applicationState';

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
    const response = await fetch(`/auth/signup`, {
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
    const {user, token} = await response.json();
    await init(token);
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
