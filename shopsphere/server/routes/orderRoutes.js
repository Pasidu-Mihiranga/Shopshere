// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Customer routes
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// Shop owner routes
router.get('/shop', authMiddleware.isShopOwner, orderController.getShopOrders);
router.patch('/:id/status', authMiddleware.isShopOwner, orderController.updateOrderStatus);

module.exports = router;