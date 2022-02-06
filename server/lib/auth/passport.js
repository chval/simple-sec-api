'use strict';

const passport = require('passport');

const authStrategy = include('auth/local-strategy');
const User = include('models/User');

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

module.exports = passport;
