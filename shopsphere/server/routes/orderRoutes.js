const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateOrder, validationHandler } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Customer routes
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', validateOrder, validationHandler, orderController.createOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

// Shop owner routes
router.patch('/:id/status', authMiddleware.isShopOwner, orderController.updateOrderStatus);

module.exports = router;