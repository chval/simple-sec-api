'use strict';

const express = require('express');

const adminController = include('controllers/admin');

const router = express.Router();

router.use((req, res, next) => {
    const passport = req.session.passport;

    //if ( !passport.is_admin ) {
    //    return res.redirect('/');
    //}

    next();
});

router.get('/', adminController.getAdmin);

module.exports = router;
