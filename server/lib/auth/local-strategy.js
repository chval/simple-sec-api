'use strict';

const LocalStrategy = require('passport-local').Strategy;

const UserLogin = include('models/UserLogin');
const Password = include('auth/Password');

module.exports.instance = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    // verify callback
    async (email, password, done) => {
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
    }
);
