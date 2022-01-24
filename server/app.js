'use strict';

const express = require('express');
//const bodyParser = require('body-parser');
const path = require('path');
const mainRouter = require('./routes/main');

const port = process.env.SEC_API_PORT || 8080;
const host = '0.0.0.0';

const app = express();

app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
//app.use(bodyParser.json());

app.use('/', mainRouter);

app.listen(port, host, () => {
    console.log(`Running on ${host}:${port}`);
});
