const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/register', authController.register);


router.post('/login', authController.login);


router.post('/social-login', authController.socialLogin);


router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

module.exports = router;