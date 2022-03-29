'use strict';

const dbConnect = include('knex');
const UserException = include('ui/UserException');

class User {
    constructor(data) {
        try {
            this.validate(data);
        } catch(err) {
            throw err;
        }

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
        if ( this._loaded ) return;

        const db = await dbConnect.getInstance();
        const users = await db('user').where('id', this.id);
        const [user] = users;

        if ( user ) {

            this.id = user.id;
            this.first_name = user.first_name;
            this.last_name = user.last_name;
        }

        this._loaded = true;
        return this._loaded;
    }

    async save() {
        await this.load();

        const db = await dbConnect.getInstance();
        let savedOk;

        if ( !this.id ) {
            const insertIds = await db('user').insert({
                id: null,
                first_name: this.first_name,
                last_name: this.last_name
            });

            this.id = insertIds[0];

            savedOk = this.id;
        } else {

            const updatedCount = await db('user').where({ id: this.id }).update({
                first_name: this.first_name,
                last_name: this.last_name
            });

            savedOk = updatedCount;
        }

        return savedOk;
    }
}

module.exports = User;
