'use strict';

const express = require('express');

const adminController = include('controllers/admin');
const UserAdmin = include('models/UserAdmin');

const router = express.Router();

router.use(async (req, res, next) => {
    const userId = req.session.passport.user;

    const userAdmin = new UserAdmin({ user_id: userId });

    await userAdmin.load();

    if ( !userAdmin.id ) {
       return res.redirect('/');
    }

    next();
});

router.get('/', adminController.getAdmin);

module.exports = router;
