import { observable } from 'mobx';

import { navigate } from './router';
import uiState, { setSnackBar } from './ui';
import { postRest, GenericHttpError, UnauthorizedError } from '../client';

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
        await postRest(`/auth/login`, { password, email });
        navigate('/studies');
    } catch (error) {
        if (error instanceof GenericHttpError && error.errorMessage) {
            setSnackBar('error', error.errorMessage);
        } else {
            setSnackBar('error', `Unable to log in, are email and password correct?`);
        }
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
