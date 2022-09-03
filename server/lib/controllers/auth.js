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
            throw Translation.getMessage('errors.user_exists');
        }

        const savedOk = await userLogin.save();

        if ( savedOk ) {
            successMessage = await Translation.getMessage('messages.registration_success').catch(err => catchError(err));
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
            const loginVerifyError = await Translation.getMessage('errors.login_unverified').catch(err => catchError(err));

            return res.render('login', {
                formData: req.body,
                error: loginVerifyError
            });
        } else {
            req.login(user, function(err) {
                if (err) return next(err);

                if ( req.body.remember_me === 'on' ) {
                    const maxAge = parseInt(process.env.SEC_API_SESSION_TTL_MS);

                    if ( isNaN(maxAge) ) {
                        return next(Translation.getMessage('errors.not_implemented'));
                    }

                    req.session.cookie.maxAge = maxAge;
                } else {
                    req.session.cookie.expires = false;
                }

                return res.redirect('/');
            });
        }
    })(req, res, next);
}

module.exports.deleteLogout = function(req, res) {
    req.logout();

    res.status(200).end();
}
