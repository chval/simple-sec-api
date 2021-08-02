'use strict';

const express = require('express');

const port = process.env.SEC_API_PORT || 8080;
const host = '0.0.0.0';

const app = express();

app.get('/', (req, res) => {
    res.send("Welcome!");
});

app.listen(port, host);
console.log(`Running on ${host}:${port}`);