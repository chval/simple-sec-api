#!/usr/bin/env node
'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// load config variables from .env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '/../.env') });

global.include = function(path) {
    return require(__dirname + '/../lib/' + path);
}

const opts = initYargs();
const command = opts._[0];

const actionModule = include('migrate/Action');
const actionClass = opts.type === 'sql' ? actionModule.SqlMigrateAction : actionModule.MongoMigrateAction;

processCommand(command).then(function() {
    process.exit(0);
}).catch(err => {
    console.log(err);
    process.exit(1);
});

async function processCommand(command) {
    const actionInstance = new actionClass();

    if ( command === 'new' ) {
        const newFileName = await actionInstance.newFile(opts.name);
        console.log(`Created file: ${newFileName}`);
    } else if ( command === 'list' ) {
        const files = await actionInstance.getNotMigratedFilenames();

        if ( !files.length ) {
            console.log('Empty list');
        } else {
            console.log('Waiting files list:');

            for ( let f of files ) {
                console.log(`\t- ${f}`);
            }
        }
    } else if ( command === 'up' ) {
        const files = await actionInstance.migrate(opts.filename);
        console.log('Migrated ' + files.length + ' file(s):');

        for ( let f of files ) {
            console.log(`\t- ${f}`);
        }
    } else if ( command === 'last' ) {
        const file = await actionInstance.lastFilename();

        if ( !file ) {
            console.log('No one file was migrated yet');
        } else {
            console.log('Last migrated file was: ' + file);
        }
    } else if ( command === 'drop' ) {
        const files = await actionInstance.dropFileRecord(opts.filename);

        if ( !files.length ) {
            console.log("Couldn't drop any file record(s)");
        } else {
            console.log('Dropped record(s) for:');

            for ( let f of files ) {
                console.log(`\t- ${f}`);
            }
        }
    } else {
        console.error(`Unknown command: ${command}`);
    }
}

function initYargs() {
    return yargs(hideBin(process.argv))
    .option('t', {
        alias: 'type',
        demandOption: true,
        default: 'sql',
        describe: 'database type for migration',
        type: 'string',
        choices: ['sql', 'mongo']
    })
    .command('new <name>', 'create new migration file', (yargs) => {
        yargs.positional('name', {
            describe: 'name of new migration',
            type: 'string'
        })
    })
    .command('list', 'get all not migrated file(s) list')
    .command('up [filename..]', 'migrate selected or not migrated file(s)', (yargs) => {
        yargs.positional('filename', {
            describe: 'filename(s) to migrate',
            type: 'string',
        })
    })
    .command('last', 'show last migrated file')
    .command('drop <filename..>', 'remove selected file(s) from migrated', (yargs) => {
        yargs.positional('filename', {
            describe: 'filename(s) to drop record(s) for',
            type: 'string',
        })
    })
    .demandCommand(1)
    .help()
    .argv;
}
