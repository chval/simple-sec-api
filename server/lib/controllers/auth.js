'use strict';

const UserLogin = include('models/UserLogin');
const Translation = include('ui/Translation');
const LocalPassport = include('auth/Passport');
const {formatErrors} = include('ui/error-handler');

module.exports.getLogin = function(req, res) {
    res.locals = req.session.flash;
    delete req.session.flash;

    return res.render('login');
}

module.exports.getRegister = function(req, res) {
    if ( req.isAuthenticated() ) {
        return res.redirect('/');
    }

    res.render('main/register');
}

module.exports.postRegister = async function(req, res, next) {
    const email = req.body.email;

    let successMessage;

    try {
        const userLogin = new UserLogin({ email });
        userLogin.setPassword(req.body.password);

        await userLogin.load();

        if ( userLogin.id ) {
            throw Translation.getMessage('errors.user_exists');
        }

        const savedOk = await userLogin.save();

        if ( savedOk ) {
            successMessage = await Translation.getMessage('messages.registration_success').catch(err => '😊');
        }
    } catch (err) {
        return next(err);
    }

    req.session.flash = {
        successMessage,
        formData: { email }
    }

    res.redirect('/auth/login');
}

module.exports.postLogin = function(req, res, next) {
    const passport = LocalPassport.getInstance();

    return passport.authenticate('local', (err, user, info) => {
        if ( err || !user ) {
            return next(err || Translation.getMessage('errors.login_unverified'));
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
