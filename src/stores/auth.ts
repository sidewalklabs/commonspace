import { observable, autorun } from 'mobx';
import { navigate } from './router';

interface AuthState {
    isAuth: boolean;
}

const authState = observable({
    isAuth: false
});

autorun(() => {
    console.log('user auth: ', authState.isAuth);
});

export default authState;
