// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/') // Make sure this directory exists
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

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate);

// Shop owner routes
router.get('/shop', authMiddleware.isShopOwner, productController.getShopProducts);
router.post('/', authMiddleware.isShopOwner, upload.array('images', 5), productController.createProduct);
router.put('/:id', authMiddleware.isShopOwner, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', authMiddleware.isShopOwner, productController.deleteProduct);
router.patch('/:id/status', authMiddleware.isShopOwner, productController.updateProductStatus);

module.exports = router;

// server/controllers/productController.js
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product...', req.body);
    
    const {
      name,
      description,
      price,
      category,
      subCategory,
      quantity,
      sku,
      isActive,
      isPromoted
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: 'Please provide all required fields: name, description, price, and category'
      });
    }

    // Get shop ID from authenticated user
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(400).json({
        message: 'Shop not found. Please create a shop first.'
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/products/${file.filename}`);
      });
    }

    // Create product
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      subCategory: subCategory || '',
      shopId: shop._id,
      images,
      inventory: {
        quantity: parseInt(quantity) || 0,
        sku: sku || `PROD-${Date.now()}`
      },
      isActive: isActive === 'true' || isActive === true,
      isPromoted: isPromoted === 'true' || isPromoted === true
    });

    await product.save();

    // Populate category name for response
    await product.populate('category', 'name');

    console.log('Product created successfully:', product._id);

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        ...product.toObject(),
        categoryName: product.category?.name
      }
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Get shop products
exports.getShopProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const products = await Product.find({ shopId: shop._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    // Add category name to each product
    const productsWithCategory = products.map(product => ({
      ...product.toObject(),
      categoryName: product.category?.name || 'Unknown'
    }));

    res.json(productsWithCategory);
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      subCategory,
      quantity,
      sku,
      isActive,
      isPromoted
    } = req.body;

    // Find product and verify ownership
    const shop = await Shop.findOne({ ownerId: req.user._id });
    const product = await Product.findOne({ _id: id, shopId: shop._id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Process new images if uploaded
    let images = product.images;
    if (req.files && req.files.length > 0) {
      const newImages = [];
      req.files.forEach(file => {
        newImages.push(`/uploads/products/${file.filename}`);
      });
      images = [...images, ...newImages];
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: parseFloat(price),
        category,
        subCategory: subCategory || '',
        images,
        inventory: {
          quantity: parseInt(quantity) || 0,
          sku: sku || product.inventory.sku
        },
        isActive: isActive === 'true' || isActive === true,
        isPromoted: isPromoted === 'true' || isPromoted === true,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('category', 'name');

    res.json({
      message: 'Product updated successfully',
      product: {
        ...updatedProduct.toObject(),
        categoryName: updatedProduct.category?.name
      }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product and verify ownership
    const shop = await Shop.findOne({ ownerId: req.user._id });
    const product = await Product.findOne({ _id: id, shopId: shop._id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(id);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Update product status
exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Find product and verify ownership
    const shop = await Shop.findOne({ ownerId: req.user._id });
    const product = await Product.findOne({ _id: id, shopId: shop._id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = isActive;
    await product.save();

    res.json({ 
      message: 'Product status updated successfully',
      isActive: product.isActive
    });

  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({
      message: 'Failed to update product status',
      error: error.message
    });
  }
};

// Get all products (public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('shopId', 'shopName')
      .sort({ createdAt: -1 });

    res.json({
      products: products,
      total: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('shopId', 'shopName logo');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Make sure to register these routes in your main app.js
// app.use('/api/products', productRoutes);