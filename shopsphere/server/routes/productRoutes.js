// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/products/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes (no authentication required)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate);

// IMPORTANT: Put specific routes BEFORE general ones
// Shop owner routes - these must come BEFORE the general routes
router.get('/shop/products', authMiddleware.isShopOwner, productController.getShopProducts);
router.post('/shop/create', authMiddleware.isShopOwner, upload.array('images', 5), productController.createProduct);
router.put('/shop/:id', authMiddleware.isShopOwner, upload.array('images', 5), productController.updateProduct);
router.delete('/shop/:id', authMiddleware.isShopOwner, productController.deleteProduct);
router.patch('/shop/:id/status', authMiddleware.isShopOwner, productController.updateProductStatus);

module.exports = router;