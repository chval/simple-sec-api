'use strict';

const userExceptionCodes = {
    'general': 'Sorry, something went wrong',
    'register.user_exists': 'User already exists',
    'register.required.email': 'Email address is required',
    'register.required.password': 'Password is required',
    'login.verify': 'Invalid credentials',
};

class UserException {
    constructor(code) {
        this.code = code;
        this.message = userExceptionCodes[code] ?? 'Unknown error';
    }

    getMessage(lang) {
        return lang ? this._getTranslatedMessage(lang) : this.message;
    }

    _getTranslatedMessage(lang) {

        // no implementation yet
        return this.message;
    }
}

module.exports = UserException;
