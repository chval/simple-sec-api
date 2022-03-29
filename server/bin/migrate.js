'use strict';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

global.include = function(path) {
    return require(__dirname + '/../lib/' + path);
}

const KnexConnect = include('KnexConnect');
const commands = include('migrate/commands');

(async () => {

    // init database
    await KnexConnect.init()
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });

    const opts = await initYargs();

    const command = opts._[0];

    if ( command === 'new' ) {
        let newFileName = commands.newFile(opts.name);

        if ( !newFileName ) {
            process.exit(1);
        } else {
            console.log(`Created file: ${newFileName}`);
        }
    } else if ( command === 'up' ) {
        let files = await commands.update(opts.filename);

        console.log('Migrated ' + files.length + ' file(s):');

        for ( let f of files ) {
            console.log(`\t- ${f}`);
        }
    } else if ( command === 'list' ) {
        let files = await commands.list();

        if ( !files.length ) {
            console.log('Empty list');
        } else {
            console.log('Waiting files list:');

            for ( let f of files ) {
                console.log(`\t- ${f}`);
            }
        }
    } else if ( command === 'last' ) {
        let file = await commands.last();

        if ( !file ) {
            console.log('No one file was migrated yet');
        } else {
            console.log('Last migrated file was: ' + file);
        }
    } else if ( command === 'drop' ) {
        let files = await commands.drop(opts.filename);

        if ( !files.length ) {
            console.log("Couldn't drop any file(s)");
            process.exit(1);
        } else {
            console.log('Dropped files list:');

            for ( let f of files ) {
                console.log(`\t- ${f}`);
            }
        }
    }
})().then(function() {
    process.exit(0);
});

async function initYargs() {
    return await yargs(hideBin(process.argv))
    .command('new <name>', 'create new migration file', (yargs) => {
        yargs.positional('name', {
            describe: 'migration file name that will be created',
            type: 'string'
        })
    })
    .command('up [filename..]', 'execute all/selected not yet migrated file(s)', (yargs) => {
        yargs.positional('filename', {
            describe: 'migration file name that already exists',
            type: 'string',
        })
    })
    .command('list', 'get all not yet migrated file(s) list')
    .command('last', 'show last migrated file')
    .command('drop <filename..>', 'remove selected migraion file(s) from db migrations table', (yargs) => {
        yargs.positional('filename', {
            describe: 'migration file(s) that will be dropped',
            type: 'string',
        })
    })
    .demandCommand(1)
    .argv;
}