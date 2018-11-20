import express from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';

const router = express.Router();

router.post('/signup', (req, res, next) => {
    passport.authenticate('signin',
                          {session: false, successRedirect: '/', failureRedirect: 'signup'},
                          (err, user)=> {
                              // TODO handle user already exists ....
                              if (err) throw err;
                              const token = jwt.sign(user, process.env.jwt_secret);
                              return res.json({token});
                          })(req, res, next)
})

router.post('/login', (req, res, next) => {
    passport.authenticate('login',
                          {session: false},
                          (err, user) => {
                              if (err) throw err;
                              const token = jwt.sign(user, process.env.jwt_secret);
                              return res.json({token})
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
                const token = jwt.sign(req.user, process.env.jwt_secret);
                return res.json({token});
            });
    router.get('/google/token',
               passport.authenticate('google-token', {session: false}),
               (req, res) => {
                   const token = jwt.sign(req.user, process.env.jwt_secret);
                   return res.json({token});
               })
}

export default router;
