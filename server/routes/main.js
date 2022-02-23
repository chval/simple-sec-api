'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const LocalPassport = include('auth/Passport');
const mainController = include('controllers/main');

const router = express.Router();

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

// init auth passport
const passport = new LocalPassport();
router.use(passport.initialize());
router.use(passport.session());

// add some locals to all pages
router.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

router.get('/', mainController.getMain);

module.exports = router;
