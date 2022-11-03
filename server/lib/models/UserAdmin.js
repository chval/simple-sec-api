'use strict';

const KnexConnect = include('KnexConnect');

class UserAdmin {
    constructor(data) {
        this.validate(data);

        this.user_id = data.user_id;
    }

    validate(data) {

        if ( !(data && typeof(data) === 'object') ) {
            throw 'Missed or invalid format of required argument: data';
        }

        // check if id set
        if ( !data.hasOwnProperty('user_id') ) {
            throw 'Missed required data key: user_id';
        } else if ( !data.user_id ) {
            throw 'Missed required data value: user_id';
        }
    }

    async load() {
        const db = KnexConnect.getInstance();
        const [userAdmin] = await db('user_admin').where('user_id', this.user_id);

        if ( userAdmin ) {

            this.id = userAdmin.id;
        }

        return this.id;
    }

    async save() {
        const isExists = await this.load();

        const db = KnexConnect.getInstance();
        let savedOk = 1;

        if ( !isExists ) {
            [savedOk] = await db('user_admin').insert({
                user_id: this.user_id
            });
        } else {
            // here we may save some permissions, etc...
            // savedOk = await db('user_admin').where({ id: this.id }).update({});
        }

        return savedOk;
    }
}

module.exports = UserAdmin;
