// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Webhook route (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Protected routes
router.use(authMiddleware.authenticate);

router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/confirm-payment', paymentController.confirmPayment);
router.post('/create-payment-method', paymentController.createPaymentMethod);

module.exports = router;