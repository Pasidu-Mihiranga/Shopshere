// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/social-login', userController.socialLogin);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate);

router.get('/me', userController.getCurrentUser);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);

// Address management
router.get('/addresses', userController.getUserAddresses);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:id', userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);

module.exports = router;