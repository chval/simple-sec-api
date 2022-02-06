'use strict';

const userTextCodes = {
    'register.success': 'Registration was successfull. Now you can <a href="login">login</a>',
};

class UserText {
    constructor(code) {
        this.code = code;
        this.message = userTextCodes[code] ?? '(text not found)';
    }

    static getMessage(code, lang) {
        const text = lang ? this._getTranslatedMessage(code, lang) : userTextCodes[code];
        return text ?? '(text not found)';
    }

    _getTranslatedMessage(code, lang) {

        // no implementation yet
        return userTextCodes[code];
    }
}

module.exports = UserText;
