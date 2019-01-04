import express from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';

const router = express.Router();

function addCookieToResponse(res, payload) {
    const expires = new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION_MS))
    const jwtPayload = {
        ...payload,
        expires
    };
    const cookieOptions =  process.env.NODE_ENV === 'development' ?
        { expires, httpOnly: true} :
        { expires, httpOnly: true, secure: true }
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET);
    res.cookie('commonspacejwt', token, cookieOptions);
    //res.cookie('commonspaceloggedin', {login: true}, {expires});
    return res;
}

router.post('/signup', (req, res, next) => {
    passport.authenticate('signin',
                          {session: false, successRedirect: '/', failureRedirect: 'signup'},
                          (err, user)=> {
                              // TODO handle user already exists ....
                              // TODO handle password sanitize
                              if (err) throw err;
                              res = addCookieToResponse(res, user);
                              return res.status(200).send();
                          })(req, res, next)
})

router.post('/login', (req, res, next) => {
    passport.authenticate('login',
                          {session: false},
                          (err, user) => {
                              if (err) throw err;
                              res = addCookieToResponse(res, user);
                              return res.status(200).send();
                          })(req, res, next);
})


if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    router.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    router.get('/google/callback',
            passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/'
            }),
            (req, res) => {
                const token = jwt.sign(req.user, process.env.JWT_SECRET);
                return res.json({token});
            });
    router.get('/google/token',
               passport.authenticate('google-token', {session: false}),
               (req, res) => {
                   const token = jwt.sign(req.user, process.env.JWT_SECRET);
                   return res.json({token});
               })
}

export default router;
