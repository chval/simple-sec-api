'use strict';

const express = require('express');

const authController = include('controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.delete('/logout', authController.deleteLogout);

module.exports = router;
