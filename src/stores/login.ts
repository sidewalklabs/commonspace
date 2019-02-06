import { observable } from 'mobx';

import authState from './auth';
import { navigate } from './router';
import uiState, { setSnackBar } from './ui';
import { postRest } from '../client';

export async function logInUser() {
    const { password, email } = loginState;
    const data = {
        password,
        email
    };
    try {
        await postRest(`/auth/check_whitelist`, { email });
        await postRest(`/auth/login`, { password, email });
        authState.isAuth = true;
        navigate('/studies');
    } catch (error) {
        setSnackBar('error', `Unable to log in, are email and password correct?`);
    } finally {
        resetLoginState();
    }
}

function resetLoginState() {
    loginState.email = '';
    loginState.password = '';
}

export interface LogInState {
    email: string;
    password: string;
    emailErrorMessage: string;
    passwordErrorMessage: string;
}

const loginState: LogInState = observable({
    email: '',
    password: '',
    emailErrorMessage: '',
    passwordErrorMessage: ''
});

export default loginState;
