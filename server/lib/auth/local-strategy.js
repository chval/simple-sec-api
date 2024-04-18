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

        try {
            await userLogin.load();
        } catch(err) {
            return done(err);
        };

        if ( !userLogin.id ) {
            return done(null, false);
        }

        const passwordObj = new Password(password);

        if ( !passwordObj.check(userLogin.password) ) {
            return done(null, false, {user_id: userLogin.user_id});
        }

        return done(null, userLogin.user_id);
    }
);
