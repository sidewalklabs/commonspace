import { observable, autorun } from 'mobx';

interface AuthState {
    isAuth: boolean;
}

// this wrapping isn't great, because we can't handle errors generically underneath, we need special knowledge about f
export async function logoutIfUnAuthorized(
    f: (...args: any[]) => Promise<Response>
): Promise<Response> {
    const response = await f();
    if (response.status === 401) {
        authState.isAuth = false;
        return response;
    }
    return response;
}

const authState = observable({
    isAuth: false
});

autorun(() => {
    console.log('user auth: ', authState.isAuth);
});

export default authState;
