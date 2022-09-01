'use strict';

const fs = require('fs');
const readLine = require('readline');
const path = require('path');

const settings = include('settings');
const fileDateHelper = include('migrate/file-date');

const KnexConnect = include('KnexConnect');

/*
* Get all sql migration files that match pattern
*/
function _getAllFiles() {
    const dir = settings.MIGRATION_FILES_DIR_SQL;

    try {
        fs.accessSync(dir, fs.constants.R_OK);
    } catch ( err ) {
        console.error(err); return null;
    }

    const re = /^\d{4}\-\d{2}\-\d{2}_\d{2}_\d{2}_\d{2}_\w+\.sql$/;

    let files = fs.readdirSync(dir).filter(fileName => {
        return fs.lstatSync(path.join(dir, fileName)).isFile() && re.test(fileName);
    });

    return files.sort();
}

/*
* Read sql migration file and return queries array
*/
async function _readFile(file) {
    let fileStream = fs.createReadStream(file);

    const rl = readLine.createInterface({
        input       : fileStream,
        crlfDelay   : Infinity
    });

    let queries = [];
    let curQuery = '';

    for await ( let line of rl ) {
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

/*
* Get sql files list that require migration
*/
async function _getNotMigrated() {
    let files = _getAllFiles();

    let migratedFiles = {};
    let db = KnexConnect.getInstance();
    let migrObjs = await db.select('file').table(settings.MIGRATIONS_STORAGE_NAME);

    migrObjs.forEach(mo => {
        migratedFiles[mo.file] = 1;
    });

    let notMigratedFiles = [];

    for ( let i = 0; i < files.length; i++ ) {
        let fileName = files[i];

        if ( !migratedFiles[fileName] ) {
            notMigratedFiles.push(fileName);
        }
    }

    return notMigratedFiles;
}

/*
* Touch new sql migration file
*/
function newFile(justName) {
    const dir = settings.MIGRATION_FILES_DIR_SQL;

    try {
        fs.accessSync(dir, fs.constants.W_OK);
    } catch ( err ) {
        console.error(err); return null;
    }

    // this value will be returned if success
    let resFileName;

    let _resFileName = dir + fileDateHelper.date4filename(new Date()) + '_' + justName + '.sql';

    try {
        fs.closeSync(fs.openSync(_resFileName, 'w'));
        resFileName = _resFileName;
    } catch ( err ) {
        console.error(err); return null;
    }

    return resFileName;
}

/*
* Execute all/some sql migration files that are still not migrated
*/
async function update(files) {

    if ( !files || !files.length ) {
        files = await _getNotMigrated();
    }

    let db = KnexConnect.getInstance();
    let doneFiles = [];

    for ( let i = 0; i < files.length; i++ ) {
        let fileName = files[i];
        let resFileName = path.resolve(settings.MIGRATION_FILES_DIR_SQL, fileName);

        let queries = await _readFile(resFileName);

        try {
            await db.transaction(async (trx) => {
                for ( let i = 0; i < queries.length; i++ ) {
                    await trx.raw(queries[i]);
                }

                await trx(settings.MIGRATIONS_STORAGE_NAME).insert({file: fileName});

                doneFiles.push(fileName);
            });
        } catch ( err ) {
            console.error(err);
            break;
        }
    }

    return doneFiles;
}

/*
* Get sql files list that require migration
*/
async function list() {
    return _getNotMigrated();
}

/*
* Select last file record from migrations table
*/
async function last() {
    let db = KnexConnect.getInstance();
    let migrObj = await db.select('file').from(settings.MIGRATIONS_STORAGE_NAME).orderBy('id', 'desc').limit(1);

    return migrObj.length ? migrObj[0].file : null;
}

/*
* Remove file record from migrations table
*/
async function drop(files) {
    let db = KnexConnect.getInstance();
    let doneFiles = [];

    for ( let i = 0; i < files.length; i++ ) {
        let fileName = files[i];

        try {
            let success = await db(settings.MIGRATIONS_STORAGE_NAME).where('file', fileName).del();

            if ( success ) {
                doneFiles.push(fileName);
            }
        } catch ( err ) {
            console.error(err);
        }
    }

    return doneFiles;
}

module.exports = {
    newFile,
    update,
    list,
    last,
    drop
};
