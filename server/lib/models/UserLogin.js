'use strict';

const KnexConnect = include('KnexConnect');
const Password = include('auth/Password');
const Translation = include('ui/Translation');

class UserLogin {
    constructor(data) {
        const errors = this.validate(data);
        if (errors) throw errors;

        this.email = data.email;
    }

    validate(data) {
        let errors = new Map();

        if ( !(data && typeof(data) === 'object') ) {
            throw 'Missed or invalid format of required argument: data';
        }

        // check if email address set
        if ( !data.hasOwnProperty('email') ) {
            throw 'Missed required data key: email';
        } else if ( !data.email ) {
            errors.set('email', Translation.getMessage('errors.email_required'));
        }

        return errors.size ? errors : null;
    }

    async load() {
        if ( this.id ) return;

        const db = KnexConnect.getInstance();
        const [userLogin] = await db('user_login').where('email', this.email);

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
}

module.exports = UserLogin;
