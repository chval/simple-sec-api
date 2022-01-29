const express = require('express');
const bodyParser = require('body-parser');

const UserLogin = include('models/UserLogin');
const UserException = include('helpers/UserException');
const UserText = include('helpers/UserText');

const router = express.Router();

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

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

module.exports = router;
