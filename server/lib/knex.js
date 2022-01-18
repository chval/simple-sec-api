'use strict';

const knex = require('knex');

const settings = include('settings');

class KnexConnect {
    constructor() {
        this.db = null;
    }

    async getInstance() {
        if ( this.db === null ) {
            this.db = await this.connect();
        }

        return this.db;
    }

    async connect() {
        let db = knex(settings.DB_CONN);

        const tExists = await db.schema.hasTable(settings.DB_MIGRATIONS_TABLE);

        if ( !tExists ) {
            await db.schema.createTable(settings.DB_MIGRATIONS_TABLE, t => {
                t.increments('id').primary();
                t.string('file', 256).notNullable();
                t.datetime('created_at').notNullable().defaultTo(db.fn.now());

                t.unique('file');
            });
        }

        return db;
    }
}

module.exports = new KnexConnect();
