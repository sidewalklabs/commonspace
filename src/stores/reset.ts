import { observable } from 'mobx';

import {navigate} from './router';
import { setSnackBar } from './ui';

export interface ResetState {
    email: string;
}

export async function resetPasswordRequest () {
    const { email } = resetState
    const data = { email }
    const response = await fetch('/auth/request_reset_password', {
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
        navigate('/signup');
        setSnackBar('success', 'Email sent with reset link')
    } else {
        console.error(response.statusText);
        setSnackBar('error', `Error sending reset email: ${response.statusText}`);
    }
}

const resetState: ResetState = observable({
    email: ''
})

export default resetState;
