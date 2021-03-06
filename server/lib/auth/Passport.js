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
                const user = new User({ id: userId });
                const isLoaded = await user.load().catch(err => {
                    console.error(err);
                    return false;
                });

                if ( !isLoaded ) {
                    return done(null, false);
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
