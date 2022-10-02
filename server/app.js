'use strict';

const express = require('express');
const session = require('express-session');
const knexSessionStore  = require("connect-session-knex")(session);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '/.env') });

// include local libraries
global.include = function(path) {
    return require(__dirname + '/lib/' + path);
}

const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');

const settings = include('settings');
const KnexConnect = include('KnexConnect');
const MongoConnect = include('MongoConnect');

// app initialization start
const port = process.env.SEC_API_PORT || 8080;
const host = '0.0.0.0';

const app = express();

// static bootstrap files
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

Promise.allSettled([KnexConnect.init(), MongoConnect.init()])
    .then(dbs => {
        const [pKnex, pMongo] = dbs;

        if ( pKnex.status !== 'fulfilled' ) {
            throw pKnex.reason;
        }

        if ( pMongo.status !== 'fulfilled' ) {

            // connection to mongodb is not critical
            console.error('mongodb: ' + pMongo.reason.message);
        }

        startApp(pKnex.value);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

function startApp(knex) {
    app.use(session({
        secret: process.env.SEC_API_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
        },
        store: new knexSessionStore({
            knex: knex,
            tablename: settings.SQL_DB_SESSIONS_TABLE,
            createtable: true,
            clearInterval: 1000 * 60 * 60
        })
    }));

    // add routes usage here
    app.use('/', mainRouter);
    app.use('/auth', authRouter);

    // start listening
    app.listen(port, host, () => {
        console.log(`Running on ${host}:${port}`);
    });
}
