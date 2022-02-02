const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = include('models/User');
const UserLogin = include('models/UserLogin');
const UserException = include('helpers/UserException');
const UserText = include('helpers/UserText');
const Password = include('helpers/Password');

const router = express.Router();

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

const verifyCallbak = async (email, password, done) => {
    const userLogin = new UserLogin({ email });
    await userLogin.load();

    if ( ! userLogin.id ) {
        return done(null, false);
    }

    const passwordObj = new Password(password);

    if ( !passwordObj.check(userLogin.password) ) {
        return done(null, false);
    }

    return done(null, userLogin.user_id);
};

const authStrategy = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, verifyCallbak);

passport.use(authStrategy);

passport.serializeUser(function(userId, done) {
    process.nextTick(() => {
        done(null, userId);
    });
});

passport.deserializeUser((userId, done) => {
    process.nextTick(async () => {
        const user = new User({ id: userId });
        await user.load();

        done(null, user);
    });
});

router.use(passport.initialize());
router.use(passport.session());

router.get('/', (req, res) => {
    res.render('main/index');
});

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

router.post('/login', passport.authenticate('local'),
    (req, res) => {

        // authentication was successfull
        res.redirect('/');
    }
);

module.exports = router;
