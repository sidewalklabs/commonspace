import { Strategy } from 'passport-strategy';
import express from 'express';
import fetch from 'isomorphic-fetch';


interface GoogleTokenStrategyOptions {
    tokenFromRequest?: 'header' | 'body';
    passReqToCallback?: boolean;
}

export default class GoogleTokenStrategy extends Strategy {
    _tokenFromRequest = 'header'
    _passReqToCallback = false
    _verify = null

    constructor(options: GoogleTokenStrategyOptions, verify) {
        super()
        if (!verify) { throw new TypeError('LocalStrategy requires a verify callback'); }
        this._verify = verify;

        if (!options.tokenFromRequest) this._tokenFromRequest = options.tokenFromRequest;
        if (options.passReqToCallback) this._passReqToCallback = options.passReqToCallback;
    }

    async authenticate(req: express.Request, options) {
        const token = req.get('access-token')

        // https://developers.google.com/identity/sign-in/web/backend-auth#calling-the-tokeninfo-endpoint
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
        const body = await response.json()
        const { email, email_verified: emailVerified } = body;

        const self = this;
        
        function verified(err, user, info) {
            if (err) { return self.error(err); }
            if (!user) { return self.fail(info); }
            self.success(user, info);
        }

        if (self._passReqToCallback) {
            this._verify(req, email, verified);
        } else {
            this._verify(email, verified);
        }

    }
}
