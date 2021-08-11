'use strict';

const knex = require('knex');

const settings = include('settings');

const dbConn = knex(settings.DB_CONN);

(async () => {
    const tExists = await dbConn.schema.hasTable(settings.DB_MIGRATIONS_TABLE);

    if ( !tExists ) {
        return await dbConn.schema.createTable(settings.DB_MIGRATIONS_TABLE, t => {
            t.increments('id').primary();
            t.string('file', 256).notNullable();
            t.datetime('created_at').notNullable().defaultTo(dbConn.fn.now());

            t.unique('file');
        });
    }
})();

module.exports = dbConn;