'use strict';

const knex = require('knex');

const settings = include('settings');

class KnexConnect {
    static db = null;

    // this method must be called only once
    static init() {
        return new Promise((resolve, reject) => {
            if ( this.db !== null ) {
                reject(this.constructor.name + ' can be initialized only once');
            }

            const db = knex(settings.SQL_DB);

            db.schema.hasTable(settings.MIGRATIONS_STORAGE_NAME).then(tExists => {
                if ( tExists ) {
                    resolve(this.db = db);
                }

                db.schema.createTable(settings.MIGRATIONS_STORAGE_NAME, t => {
                    t.increments('id').primary();
                    t.string('file', 256).notNullable();
                    t.datetime('created_at').notNullable().defaultTo(db.fn.now());

                    t.unique('file');
                })
                .then(() => {
                    resolve(this.db = db);
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    static getInstance() {
        return this.db;
    }
}

module.exports = KnexConnect;
