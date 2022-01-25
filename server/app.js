'use strict';

const express = require('express');
const session = require('express-session');
const knexSessionStore  = require("connect-session-knex")(session);

const path = require('path');
const mainRouter = require('./routes/main');
require('dotenv').config({ path: path.join(__dirname, '/.env') });

// include local libraries
global.include = function(path) {
    return require(__dirname + '/lib/' + path);
}

const settings = include('settings');
const dbConnect = include('knex');

// app initialization start
const port = process.env.SEC_API_PORT || 8080;
const host = '0.0.0.0';

const app = express();

// static bootstrap files
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// we need to prepare database for sessions
dbConnect.getInstance().then((knex) => {
    app.use(session({
        secret: process.env.SEC_API_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: Number(process.env.SEC_API_SESSION_TTL_MS)
        },
        store: new knexSessionStore({
            knex: knex,
            tablename: settings.DB_SESSIONS_TABLE,
            createtable: true,
            clearInterval: 1000 * 60 * 60
        })
    }));

    // add routes usage here
    app.use('/', mainRouter);

    // start listening
    app.listen(port, host, () => {
        console.log(`Running on ${host}:${port}`);
    });
});
