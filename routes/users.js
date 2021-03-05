const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

//Just the route for the registration form
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    //We wrap our own try and catch despite the catch async already being there
    //because we want to flash the specific error message instead of giving it to 
    //the default error handler.
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            //If there somehow is an error, then next(err) passes
            //it to be dealt with by the default error handler by catchAsync.
            if (err) return next(err);

            //If no error, then login was successful!
            req.flash('success', 'Thanks for Registering and Welcome!');
            res.redirect('/portfolio');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    //If we make it into this, then login was successful.
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/portfolio';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/portfolio');
})


module.exports = router;