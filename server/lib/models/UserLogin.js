'use strict';

const KnexConnect = include('KnexConnect');
const Password = include('auth/Password');
const Translation = include('ui/Translation');

class UserLogin {
    constructor(data) {
        if (data && typeof(data) === 'object') {
            if (data.email)   this.email   = data.email;
            if (data.user_id) this.user_id = data.user_id;
        }
    }

    async load() {
        if ( this.id ) return;

        let loadByKey, loadByValue;

        if (this.email) {
            loadByKey   = 'email';
            loadByValue = this.email;
        } else if (this.user_id) {
            loadByKey   = 'user_id';
            loadByValue = this.user_id;
        } else {
            throw new Map([
                ['email', Translation.getMessage('errors.email_required')]
            ]);
        }

        const db = KnexConnect.getInstance();
        const [userLogin] = await db('user_login').where(loadByKey, loadByValue);

        if ( userLogin ) {
            this.id = userLogin.id;
            this.user_id = userLogin.user_id;
            this.password = userLogin.password;
        }

        return this.id;
    }

    async save() {
        const isExists = await this.load();

        const db = KnexConnect.getInstance();
        let savedOk;

        await db.transaction(async (trx) => {

            if ( !isExists ) {
                [this.user_id] = await trx('user').insert({ id: null });

                [savedOk] = await trx('user_login').insert({
                    user_id: this.user_id,
                    email: this.email,
                    password: this.password
                });
            } else {
                savedOk = await trx('user_login').where({ id: this.id }).update({
                    password: this.password
                });
            }
        });

        return savedOk;
    }

    setPassword(password) {
        if ( !password ) {
            throw Translation.getMessage('errors.password_required');
        }

        this.password = new Password(password).encrypt();
    }

    async logSuccessLogin(loginData) {

        if (!this.user_id) {
            throw 'Missed required attribute value: user_id';
        }

        const db = KnexConnect.getInstance();

        const [savedOk] = await db('user_login_history').insert({
            ...loginData,
            user_id: this.user_id,
            success: 1,
        });

        return savedOk;
    }

    async logFailAttempt(loginData) {
        const db = KnexConnect.getInstance();

        const [savedOk] = await db('user_login_history').insert({
            ...loginData,
            user_id: this.user_id,
            success: 0,
        });

        return savedOk;
    }
}

module.exports = UserLogin;
