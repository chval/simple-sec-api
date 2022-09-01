'use strict';

const fs = require('fs');
const readLine = require('readline');
const path = require('path');

const settings = include('settings');
const fileDateHelper = include('migrate/file-date');

class MigrateAction {

    // migration file extension
    ext = undefined;

    migrationFilesDir = undefined;

    // database client
    db = undefined;

    /*
    * Get all migration files from directory that match internal pattern
    */
    async _getAllFiles() {
        const dir = this.migrationFilesDir;
        await fs.promises.access(dir, fs.constants.R_OK);
        const re = new RegExp(`^\\d{4}\\-\\d{2}\\-\\d{2}_\\d{2}_\\d{2}_\\d{2}_\\w+\\${this.ext}$`);
        const dc = await fs.promises.readdir(dir);

        return dc
            .filter(async (fileName) => {
                const lstat = await fs.promises.lstat(path.join(dir, fileName));
                return lstat.isFile() && re.test(fileName);
            })
            .sort();
    }

    /*
    * Get files list that require migration
    */
    async _getNotMigrated() {
        const cursor = await this._fetchAllMigrationObjs(await this._getDB());

        const migratedFiles = {};

        await cursor.forEach(dbObj => {
            migratedFiles[dbObj.file] = 1;
        });

        const allFiles = await this._getAllFiles();
        const notMigratedFiles = [];

        for ( const fileName of allFiles ) {
            if ( !migratedFiles[fileName] ) {
                notMigratedFiles.push(fileName);
            }
        }

        return notMigratedFiles;
    }

    /*
    * Touch new migration file
    */
    async newFile(justName) {
        const dir = this.migrationFilesDir;
        const resFileName = dir + fileDateHelper.date4filename(new Date()) + '_' + justName + this.ext;

        await fs.promises.access(dir, fs.constants.W_OK);
        const fh = await fs.promises.open(resFileName, 'w');
        await fh.close();

        return resFileName;
    }

    /*
    * Get files list that require migration
    */
    getNotMigratedFilenames() {
        return this._getNotMigrated();
    }

    /*
    * Execute all/some migration files that are still not migrated
    */
    async migrate(files) {
        if ( !files || !files.length ) {
            files = await this._getNotMigrated();
        }

        const db = await this._getDB();
        const doneFiles = [];

        for ( const fileName of files ) {
            if ( await this._hasAlreadyMigrated(db, fileName) ) {
                throw new Error(`${fileName} already migrated`);
            }

            const filePath = path.resolve(this.migrationFilesDir, fileName);

            try {
                await this._migrateFile(db, fileName, filePath);
                doneFiles.push(fileName);
            } catch(err) {
                console.error(err);
                break;
            }
        }

        return doneFiles;
    }

    /*
    * Select last migrated filename
    */
    async lastFilename() {
        const db = await this._getDB();

        const migrObj = await this._fetchLastMigratedObj(db);

        return migrObj?.file;
    }

    /*
    * Remove filename from migrated
    */
    async dropFileRecord(files) {
        const db = await this._getDB();
        const doneFiles = [];

        for ( const fileName of files ) {
            const deleted = await this._dropFileRecord(db, fileName);

            if ( deleted ) {
                doneFiles.push(fileName);
            }
        }

        return doneFiles;
    }

    _getDB() {
        throw new Error('_getDB: must be implemented in sub class');
    }

    _fetchAllMigrationObjs(db) {
        throw new Error('_fetchAllMigrationObjs: must be implemented in sub class');
    }

    _fetchLastMigratedObj(db) {
        throw new Error('_fetchLastMigratedObj: must be implemented in sub class');
    }

    _hasAlreadyMigrated(db, fileName) {
        throw new Error('_hasAlreadyMigrated: must be implemented in sub class');
    }

    _migrateFile(db, fileName, filePath) {
        throw new Error('_migrateFile: must be implemented in sub class');
    }

    _dropFileRecord(db, fileName) {
        throw new Error('_dropFileRecord: must be implemented in sub class');
    }
}

class SqlMigrateAction extends MigrateAction {
    constructor() {
        super();
        this.ext = '.sql';
        this.migrationFilesDir = settings.MIGRATION_FILES_DIR_SQL;
    }

    /*
    * Read sql migration file and return queries array
    * !!! assumed that queries are separated by empty line
    */
    async _readFile(filePath) {
        const fileStream = fs.createReadStream(filePath);

        const rl = readLine.createInterface({
            input       : fileStream,
            crlfDelay   : Infinity
        });

        const queries = [];
        let curQuery = '';

        for await ( const line of rl ) {
            if ( line ) {
                curQuery += line;
            } else {
                queries.push(curQuery);
                curQuery = '';
            }
        }

        queries.push(curQuery);

        return queries;
    }

    async _getDB() {
        if ( this.db ) return this.db;

        const KnexConnect = include('KnexConnect');
        const db = await KnexConnect.init();

        return this.db = db;
    }

    _fetchAllMigrationObjs(db) {
        return db.select('file').table(settings.MIGRATIONS_STORAGE_NAME);
    }

    async _fetchLastMigratedObj(db) {
        const [migrObj] = await db.select('file').from(settings.MIGRATIONS_STORAGE_NAME).orderBy('id', 'desc').limit(1);

        return migrObj;
    }

    async _hasAlreadyMigrated(db, fileName) {
        const [{id: count}] = await db(settings.MIGRATIONS_STORAGE_NAME).where('file', fileName).count('id', {as: 'id'});

        return count;
    }

    async _migrateFile(db, fileName, filePath) {
        const queries = await this._readFile(filePath);

        return db.transaction(async (trx) => {
            for ( const q of queries ) {
                await trx.raw(q);
            }

            await trx(settings.MIGRATIONS_STORAGE_NAME).insert({file: fileName});
        });
    }

    /*
    * returns dropped records count
    */
    _dropFileRecord(db, fileName) {
        return db(settings.MIGRATIONS_STORAGE_NAME).where('file', fileName).del();
    }
}

class MongoMigrateAction extends MigrateAction {
    constructor() {
        super();
        this.ext = '.js';
        this.migrationFilesDir = settings.MIGRATION_FILES_DIR_MONGO;
    }

    async _getDB() {
        if ( this.db ) return this.db;

        const MongoConnect = include('MongoConnect');
        const db = await MongoConnect.init();

        return this.db = db;
    }

    _fetchAllMigrationObjs(db) {
        return db.collection(settings.MIGRATIONS_STORAGE_NAME).find({}, {_id: 0, file: 1});
    }

    _fetchLastMigratedObj(db) {
        return db.collection(settings.MIGRATIONS_STORAGE_NAME).findOne({}, { projection: {_id: 0, file: 1}, sort: {'created_at': -1}, });
    }

    _hasAlreadyMigrated(db, fileName) {
        return db.collection(settings.MIGRATIONS_STORAGE_NAME).countDocuments({file: fileName});
    }

    async _migrateFile(db, fileName, filePath) {
        const up = require(filePath);

        if ( typeof(up) !== 'function' ) {
            throw new Error(`${fileName} doesn't contain migrate function`);
        }

        await up(db);

        return db.collection(settings.MIGRATIONS_STORAGE_NAME).insertOne({
            file: fileName,
            created_at: new Date()
        });
    }

    /*
    * returns dropped records count
    */
    async _dropFileRecord(db, fileName) {
        const { deletedCount } = await db.collection(settings.MIGRATIONS_STORAGE_NAME).deleteOne({file: fileName});

        return deletedCount;
    }
}

module.exports = {SqlMigrateAction, MongoMigrateAction};
