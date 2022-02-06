'use strict';

const { randomBytes, pbkdf2Sync } = require('crypto');

class Password {
    constructor(password) {
        this.password = password;
        this.iterationsCount = 50000;
        this.saltBytesLength = 64;
        this.derivedKeyBytesLength = 128;
        this.digest = 'sha512';
    }

    setPassword(password) {
        this.password = password;
    }

    _encrypt = function(salt) {
        return pbkdf2Sync(
            this.password,
            salt,
            this.iterationsCount,
            this.derivedKeyBytesLength,
            this.digest
        ).toString('hex');
    };

    encrypt() {
        const salt = randomBytes(this.saltBytesLength).toString('hex');
        const passwordHash = this._encrypt(salt);

        return [salt, passwordHash].join('.');
    }

    check(hashString) {
        let [salt, originalHash] = hashString.split('.');
        const passwordHash = this._encrypt(salt);

        return passwordHash === originalHash;
    }
}

module.exports = Password;
