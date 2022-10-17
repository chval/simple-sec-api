'use strict';

const express = require('express');

const authController = include('controllers/auth');
const {catchError, formatErrors} = include('ui/error-handler');

const router = express.Router();

const routePath2Template = {
    '/login': 'login',
    '/register': 'main/register'
};

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin).use(postErrorHandler);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister).use(postErrorHandler);
router.delete('/logout', authController.deleteLogout);

// correctly handle errors on form POST
function postErrorHandler(err, req, res, next) {
    let errData;

    formatErrors(err).then(data => {
        errData = data;
    }).catch(err => {
        errData = catchError(err);
    }).finally(() => {
        res.render(routePath2Template[req.route.path], {
            formData: req.body,
            errorData: errData
        });
    });
}

module.exports = router;
