'use strict';

const db_dir = 'db/';

const settings = {
    DB_DIR: db_dir,
    DB_SQL_DIR: db_dir + 'sql/',
    DB_CONN: {
        client: 'sqlite3',
        connection: {
            filename: db_dir + 'sec_api_db.sqlite3'
        },
        useNullAsDefault: true
    },
    DB_MIGRATIONS_TABLE: '_migrations',
    DB_SESSIONS_TABLE: '_sessions'
};

module.exports = settings;