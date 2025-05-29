const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes - no authentication required
// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/social-login
// @desc    Login with social provider
// @access  Public
router.post('/social-login', authController.socialLogin);

// Protected routes - authentication required
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

module.exports = router;