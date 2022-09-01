'use strict';

const KnexConnect = include('KnexConnect');
const Password = include('auth/Password');
const Translation = include('ui/Translation');

class UserLogin {
    constructor(data) {
        try {
            const errors = this.validate(data);
            if ( errors.length ) throw errors;
        } catch(err) {
            throw err;
        }

        this.email = data.email;
    }

    validate(data) {
        let errors = [];

        if ( !(data && typeof(data) === 'object') ) {
            throw 'Missed or invalid format of required argument: data';
        }

        // check if email address set
        if ( !data.hasOwnProperty('email') ) {
            throw 'Missed required data key: email';
        } else if ( !data.email ) {
            errors.push( Translation.getMessage('errors.email_required') );
        }

        return errors;
    }

    async load() {
        if ( this._loaded ) return;

        const db = KnexConnect.getInstance();
        const userLogins = await db('user_login').where('email', this.email);
        const [userLogin] = userLogins;

        if ( userLogin ) {

            this.id = userLogin.id;
            this.user_id = userLogin.user_id;
            this.password = userLogin.password;
        }

        this._loaded = true;
        return this._loaded;
    }

    async save() {
        await this.load();

        const db = KnexConnect.getInstance();
        let savedOk;

        await db.transaction(async (trx) => {

            if ( !this.user_id ) {
                const insertUserIds = await trx('user').insert({ id: null });
                this.user_id = insertUserIds[0];

                const insertUserLoginIds = await trx('user_login').insert({
                    user_id: this.user_id,
                    email: this.email,
                    password: this.password
                });

                savedOk = insertUserLoginIds[0];
            } else {

                const updatedCount = await trx('user_login').where({ id: this.id }).update({
                    password: this.password
                });

                savedOk = updatedCount;
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
}

module.exports = UserLogin;
