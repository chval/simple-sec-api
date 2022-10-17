'use strict';

const KnexConnect = include('KnexConnect');

class User {
    constructor(data) {
        this.validate(data);

        this.id = data.id;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
    }

    validate(data) {

        if ( !(data && typeof(data) === 'object') ) {
            throw 'Missed or invalid format of required argument: data';
        }

        // check if id set
        if ( !data.hasOwnProperty('id') ) {
            throw 'Missed required data key: id';
        } else if ( !data.id ) {
            throw 'Missed required data value: id';
        }
    }

    async load() {
        const db = KnexConnect.getInstance();
        const [user] = await db('user').where('id', this.id);

        if ( user ) {

            this.id = user.id;

            // overwrite only attributes not set in constructor
            this.first_name = this.first_name ?? user.first_name;
            this.last_name = this.last_name ?? user.last_name;
        } else {
            this.id = undefined;
        }

        return this.id;
    }

    async save() {
        const isExists = await this.load();

        if ( !isExists ) {
            throw "Can't create a new User without login"
        }

        const db = KnexConnect.getInstance();

        return await db('user').where({ id: this.id }).update({
            first_name: this.first_name,
            last_name: this.last_name
        });
    }
}

module.exports = User;
