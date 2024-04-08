'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const Translation = include('ui/Translation');
const KnexConnect = include('KnexConnect');
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

// Catch all unexpected errors here
router.use((err, req, res, next) => {
    if ( err ) {
        console.error(err);
        req.logout();

        let errorMessage;

        return Translation.getMessage('errors.general')
            .then(err => errorMessage = err)
            .catch(err => errorMessage = '🙁')
            .finally(() => {
                return res.render('main/500', { errorMessage });
        });
    }

    next();
});

router.use(async (req, res, next) => {
    const isAuthenticated = req.isAuthenticated();

    if ( !isAuthenticated && !req.path.startsWith('/auth') ) {
        return res.redirect('/auth/login');
    }

    // add some locals to all pages
    res.locals.isAuthenticated = isAuthenticated;

    if ( isAuthenticated ) {
        const db = KnexConnect.getInstance();
        const [userLogin] = await db('user_login').where('user_id', req.session.passport.user);

        res.locals.myEmail = userLogin.email;
    }

    next();
});

router.get('/', mainController.getMain);

module.exports = router;
