'use strict';

const UserLogin = include('models/UserLogin');
const Translation = include('ui/Translation');
const LocalPassport = include('auth/Passport');

function getSaveLoginData(method, req) {
    return {
        method,
        user_agent: req.headers['user-agent'],
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };
}

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
        await userLogin.load();

        if ( userLogin.id ) {
            throw Translation.getMessage('errors.user_exists');
        }

        userLogin.setPassword(req.body.password);
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
    const method = 'local';

    return passport.authenticate(method, async (err, user, info) => {
        if ( err || !user ) {
            try {
                const userLogin = new UserLogin({ user_id: user || info?.user_id });
                await userLogin.logFailAttempt(getSaveLoginData(method, req));
            } catch (e) {
                console.error(e);
            }

            return next(err || Translation.getMessage('errors.login_unverified'));
        } else {
            req.login(user, async function(err) {
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

                try {
                    const userLogin = new UserLogin({ user_id: user });
                    await userLogin.logSuccessLogin(getSaveLoginData(method, req));
                } catch (err) {
                    return next(err);
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
