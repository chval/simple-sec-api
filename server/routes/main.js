const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('main/index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('main/register');
});

module.exports = router;
