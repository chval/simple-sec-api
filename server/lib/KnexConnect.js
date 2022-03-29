'use strict';

const knex = require('knex');

const settings = include('settings');

class KnexConnect {
    static db = null;

    // this method must be called only once
    static init() {
        return new Promise((resolve, reject) => {
            if ( this.db !== null ) {
                reject(this.constructor.name + " can be initialized only once");
            }

            const db = knex(settings.DB_CONN);

            db.schema.hasTable(settings.DB_MIGRATIONS_TABLE).then(tExists => {
                if ( tExists ) {
                    return db;
                }

                db.schema.createTable(settings.DB_MIGRATIONS_TABLE, t => {
                    t.increments('id').primary();
                    t.string('file', 256).notNullable();
                    t.datetime('created_at').notNullable().defaultTo(this.db.fn.now());

                    t.unique('file');
                })
                .catch(err => reject(err));
            }).then((db) => {
                this.db = db;
                resolve(this.db);
            })
            .catch(err => reject(err));
        });
    }

    static getInstance() {
        return this.db;
    }
}

module.exports = KnexConnect;
