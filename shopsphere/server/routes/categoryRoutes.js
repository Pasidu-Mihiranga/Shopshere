// server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isAdmin);

router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;