'use strict';

const db_dir = 'db/';

const settings = {
    DB_DIR: db_dir,
    MIGRATION_FILES_DIR_SQL: db_dir + 'sql/',
    MIGRATION_FILES_DIR_MONGO: db_dir + 'mongo/',
    SQLITE_DB: db_dir + 'sec_api_db.sqlite3',
    MIGRATIONS_STORAGE_NAME: '_migrations',
    SQL_DB_SESSIONS_TABLE: '_sessions'
};

module.exports = settings;
