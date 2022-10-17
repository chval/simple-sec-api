'use strict';

const passport = require('passport');

const localStrategy = include('auth/local-strategy');
const User = include('models/User');

class LocalPassport {
    constructor() {
        passport.use(localStrategy.instance);

        passport.serializeUser(function(userId, done) {
            process.nextTick(() => {
                done(null, userId);
            });
        });

        passport.deserializeUser((userId, done) => {
            process.nextTick(async () => {
                let user;

                try {
                    user = new User({ id: userId });
                    const isExists = await user.load();

                    if ( !isExists ) {
                        return done(null, false);
                    }
                } catch(err) {
                    return done(err, false);
                }

                done(null, user);
            });
        });

        return passport;
    }

    static getInstance() {
        return passport;
    }
}

module.exports = LocalPassport;
