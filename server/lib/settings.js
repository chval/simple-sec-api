'use strict';

const db_dir = 'db/';

const settings = {
    DB_DIR: db_dir,
    MIGRATION_FILES_DIR_SQL: db_dir + 'sql/',
    MIGRATION_FILES_DIR_MONGO: db_dir + 'mongo/',
    SQL_DB: {
        client: 'sqlite3',
        connection: {
            filename: db_dir + 'sec_api_db.sqlite3'
        },
        useNullAsDefault: true
    },
    MIGRATIONS_STORAGE_NAME: '_migrations',
    SQL_DB_SESSIONS_TABLE: '_sessions'
};

module.exports = settings;
