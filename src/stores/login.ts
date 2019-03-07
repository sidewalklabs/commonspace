import { observable } from 'mobx';

import { navigate } from './router';
import uiState, { setSnackBar } from './ui';
import { postRest, UnauthorizedError } from '../client';

export async function logInUser() {
    const { password, email } = loginState;
    const data = {
        password,
        email
    };
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
        await postRest(`/auth/login`, { password, email });
        navigate('/studies');
    } catch (error) {
        setSnackBar('error', `Unable to log in, are email and password correct?`);
    } finally {
        resetLoginState();
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
}

const loginState: LogInState = observable({
    email: '',
    password: '',
    emailErrorMessage: '',
    passwordErrorMessage: ''
});

export default loginState;
