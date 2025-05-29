// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/search', productController.searchProducts);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate);

// Shop owner routes
router.use('/shop', authMiddleware.isShopOwner);
router.get('/shop', productController.getShopProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/status', productController.updateProductStatus);

module.exports = router;