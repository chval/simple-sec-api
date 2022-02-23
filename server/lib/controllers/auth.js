'use strict';

const UserLogin = include('models/UserLogin');
const UserException = include('ui/UserException');
const UserText = include('ui/UserText');
const LocalPassport = include('auth/Passport');

module.exports.getLogin = function(req, res) {
    return res.render('login');
}

module.exports.getRegister = function(req, res) {
    res.render('main/register');
}

module.exports.postRegister = async function(req, res) {
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

    return res.render('main/register', {
        formData: req.body,
        errors: userErrors,
        success: successMessage
    });
}

module.exports.postLogin = function(req, res, next) {
    const passport = LocalPassport.getInstance();

    return passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        } else if ( ! user ) {
            return res.render('login', {
                formData: req.body,
                error: new UserException('login.verify').getMessage()
            });
        } else {
            req.login(user, function(err) {
                if (err) return next(err);

                return res.redirect('/');
            });
        }
    })(req, res, next);
}

module.exports.deleteLogout = function(req, res) {
    req.logout();

    res.status(200).end();
}
