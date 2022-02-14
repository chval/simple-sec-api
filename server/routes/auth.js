'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const LocalPassport = include('auth/passport');
const UserLogin = include('models/UserLogin');
const UserException = include('ui/UserException');
const UserText = include('ui/UserText');

const router = express.Router();

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('main/register');
});

router.post('/register', async (req, res) => {
    const email = req.body.email;

    let successMessage;
    let userErrors = [];

    try {
        const userLogin = new UserLogin({ email });
        userLogin.setPassword(req.body.password);

        await userLogin.load();

        if ( userLogin.id ) {
            throw new UserException('register.user_exists');
        }

        const savedOk = await userLogin.save();

        if ( savedOk ) {
            successMessage = UserText.getMessage('register.success');
        }
    } catch (err) {
        if ( typeof(err) !== 'object' || err.constructor.name !== 'Array' ) {
            err = [ err ];
        }

        err.forEach(e => {
            if ( typeof(e) === 'object' && e.constructor.name === 'UserException' ) {
                userErrors.push(e.getMessage());
            } else {
                console.log(e);
            }
        });

        // show general error if something unexpected happened
        if ( !userErrors.length ) {
            userErrors.push(new UserException('general').getMessage());
        }
    }

    res.render('main/register', { formData: req.body, errors: userErrors, success: successMessage });
});

router.post('/login', (req, res, next) => {
    const passport = LocalPassport.getInstance();

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        } else if ( ! user ) {
            return res.render('login', { formData: req.body, error: new UserException('login.verify').getMessage() });
        } else {
            req.login(user, function(err) {
                if (err) return next(err);

                return res.redirect('/');
            });
        }
    })(req, res, next);
});

router.delete('/logout', (req, res) => {
    req.logout();

    res.status(200).end();
});

module.exports = router;
