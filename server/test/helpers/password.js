const assert = require('assert');

global.include = function(path) {
    return require(__dirname + '/../../lib/' + path);
}

const Password = include('helpers/Password');

describe('Helpers -> Password', function() {
    it('should generate a salt and password encrypted hash with a fixed length', function() {
        const password = new Password('qwerty');
        let hashString = password.encrypt();

        assert.ok(hashString);
    });

    it('encrypted hash matches for same password', function() {
        const password = new Password('qwerty');
        const hashString = password.encrypt();
        const passwordOk = password.check(hashString);

        assert.equal(passwordOk, true);
    });

    it('encrypted hash doesnt match for another password', function() {
        const password = new Password('qwerty');
        const hashString = password.encrypt();

        password.setPassword('qwerty123');
        const passwordOk = password.check(hashString);
        assert.notEqual(passwordOk, true);
    });
});
