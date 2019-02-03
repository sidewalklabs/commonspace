import { observable } from 'mobx';

import {navigate} from './router';
import uiState, { setSnackBar } from './ui';

export async function logInUser() {
    const {password, email} = loginInState;
    const data = {
        password,
        email,
    }
    const response = await fetch(`/auth/login`, {
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
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    if (response.status === 200) {
        navigate('/studies');
    } else {
        console.error(response.statusText);
        setSnackBar('error', `Unable to log in, are email and password correct?`);
    }
}

export interface LogInState {
    email: string;
    password: string;
    emailErrorMessage: string;
    passwordErrorMessage: string;
}


const loginInState: LogInState = observable({
    email: '',
    password: '',
    emailErrorMessage: '',
    passwordErrorMessage: '',
})

export default loginInState;
