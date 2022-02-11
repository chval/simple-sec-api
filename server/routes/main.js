'use strict';

const express = require('express');

const LocalPassport = include('auth/passport');

const router = express.Router();

const passport = new LocalPassport();

// init auth passport
router.use(passport.initialize());
router.use(passport.session());

router.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

router.get('/', (req, res) => {
    res.render('main/index');
});

module.exports = router;
