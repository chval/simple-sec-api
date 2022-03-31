'use strict';

const UserLogin = include('models/UserLogin');
const Translation = include('ui/Translation');
const LocalPassport = include('auth/Passport');
const {formatErrors, catchError} = include('ui/error-handler');

module.exports.getLogin = function(req, res) {
    return res.render('login');
}

module.exports.getRegister = function(req, res) {
    res.render('main/register');
}

module.exports.postRegister = async function(req, res) {
    const email = req.body.email;

    let successMessage;
    let userErrors;

    try {
        const userLogin = new UserLogin({ email });
        userLogin.setPassword(req.body.password);

        await userLogin.load();

        if ( userLogin.id ) {
            throw Translation.getMessage('register.error_user_exists');
        }

        const savedOk = await userLogin.save();

        if ( savedOk ) {
            successMessage = await Translation.getMessage('register.success').catch(err => catchError(err));
        }
    } catch (err) {
        userErrors = await formatErrors(err);
    }

    return res.render('main/register', {
        formData: req.body,
        errors: userErrors,
        success: successMessage
    });
}

module.exports.postLogin = async function(req, res, next) {
    const passport = LocalPassport.getInstance();

    return passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        } else if ( !user ) {
            const loginVerifyError = await Translation.getMessage('login.error_verify').catch(err => catchError(err));

            return res.render('login', {
                formData: req.body,
                error: loginVerifyError
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
