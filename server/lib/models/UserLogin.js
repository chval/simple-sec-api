'use strict';

const dbConnect = include('knex');
const Password = include('helpers/Password');
const UserException = include('helpers/UserException');

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
            errors.push( new UserException('register.required.email') );
        }

        return errors;
    }

    async load() {
        if ( this._loaded ) return;

        const db = await dbConnect.getInstance();
        const userLogins = await db('user_login').where('email', this.email);

        if ( userLogins.length ) {

            this.id = userLogins[0].id;
            this.user_id = userLogins[0].user_id;
        }

        this._loaded = true;
    }

    async save() {
        await this.load();

        const db = await dbConnect.getInstance();
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
            throw new UserException('register.required.password');
        }

        this.password = new Password(password).encrypt();
    }
}

module.exports = UserLogin;
