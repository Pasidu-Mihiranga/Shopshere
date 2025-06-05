// server/controllers/productController.js
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Category = require('../models/Category');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product for user:', req.user._id);
    console.log('📝 Product data received:', req.body);
    console.log('📷 Files received:', req.files?.length || 0);
    
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

    // Validate required fields with detailed error messages
    const errors = [];
    
    if (!name || !name.trim()) {
      errors.push('Product name is required');
    }
    
    if (!description || !description.trim()) {
      errors.push('Product description is required');
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      errors.push('Valid price greater than 0 is required');
    }
    
    if (!category || !category.trim()) {
      errors.push('Category is required');
    }
    
    if (quantity === undefined || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      errors.push('Valid quantity (0 or greater) is required');
    }

    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({
        message: `Missing required fields: ${errors.join(', ')}`,
        errors: errors
      });
    }

    // Find or create shop for the user
    let shop = await Shop.findOne({ ownerId: req.user._id });
    
    if (!shop) {
      console.log('🏪 Creating new shop for user...');
      shop = new Shop({
        ownerId: req.user._id,
        shopName: `${req.user.firstName || 'User'}'s Shop`,
        contact: {
          email: req.user.email,
          phone: req.user.phoneNumber || ''
        },
        description: 'Welcome to my shop!',
        isActive: true
      });
      
      await shop.save();
      console.log('✅ Shop created:', shop._id);
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      console.log('❌ Category not found:', category);
      return res.status(400).json({ 
        message: 'Invalid category selected. Please choose a valid category.' 
      });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Store relative path for serving static files
        images.push(`/uploads/products/${file.filename}`);
      });
      console.log('📷 Images processed:', images.length);
    }

    // Generate SKU if not provided
    const productSku = sku && sku.trim() ? sku.trim() : `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create product data
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category,
      subCategory: subCategory ? subCategory.trim() : '',
      shopId: shop._id,
      images: images,
      inventory: {
        quantity: parseInt(quantity),
        sku: productSku
      },
      isActive: isActive === 'true' || isActive === true || isActive === 'on',
      isPromoted: isPromoted === 'true' || isPromoted === true || isPromoted === 'on'
    };

    console.log('🔄 Creating product with data:', {
      ...productData,
      images: `${productData.images.length} images`
    });

    // Create and save the product
    const product = new Product(productData);
    await product.save();

    // Update shop's product count
    await Shop.findByIdAndUpdate(shop._id, {
      $inc: { totalProducts: 1 }
    });

    // Populate category for response
    await product.populate('category', 'name');

    console.log('✅ Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        ...product.toObject(),
        categoryName: product.category?.name || 'Unknown'
      }
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Product with this SKU already exists. Please use a different SKU.'
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data format provided'
      });
    }

    res.status(500).json({
      message: 'Failed to create product. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get shop products
exports.getShopProducts = async (req, res) => {
  try {
    console.log('📦 Fetching products for user:', req.user._id);
    
    // Find shop for the authenticated user
    const shop = await Shop.findOne({ ownerId: req.user._id });
    
    if (!shop) {
      console.log('🏪 No shop found, returning empty array');
      return res.json({
        success: true,
        products: [],
        message: 'No shop found. Create your first product to set up your shop.'
      });
    }

    // Find all products for this shop
    const products = await Product.find({ shopId: shop._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    // Format products for response
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      categoryName: product.category?.name || 'Unknown'
    }));

    console.log(`✅ Found ${products.length} products for shop ${shop.shopName}`);

    res.json({
      success: true,
      products: formattedProducts,
      total: products.length
    });

  } catch (error) {
    console.error('❌ Error fetching shop products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products',
      products: []
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Updating product:', id);
    
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

    // Find shop and verify ownership
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const product = await Product.findOne({ _id: id, shopId: shop._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    // Validate required fields
    const errors = [];
    
    if (!name || !name.trim()) errors.push('Product name is required');
    if (!description || !description.trim()) errors.push('Product description is required');
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) errors.push('Valid price is required');
    if (!category) errors.push('Category is required');
    if (quantity === undefined || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) errors.push('Valid quantity is required');

    if (errors.length > 0) {
      return res.status(400).json({
        message: `Validation failed: ${errors.join(', ')}`,
        errors: errors
      });
    }

    // Process new images if uploaded
    let images = [...product.images]; // Keep existing images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      images = [...images, ...newImages];
      
      // Limit to 5 images total
      if (images.length > 5) {
        images = images.slice(-5); // Keep only the last 5 images
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        subCategory: subCategory ? subCategory.trim() : '',
        images,
        inventory: {
          quantity: parseInt(quantity),
          sku: sku && sku.trim() ? sku.trim() : product.inventory.sku
        },
        isActive: isActive === 'true' || isActive === true || isActive === 'on',
        isPromoted: isPromoted === 'true' || isPromoted === true || isPromoted === 'on',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('category', 'name');

    console.log('✅ Product updated successfully:', updatedProduct._id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        ...updatedProduct.toObject(),
        categoryName: updatedProduct.category?.name || 'Unknown'
      }
    });

  } catch (error) {
    console.error('❌ Error updating product:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'SKU already exists. Please use a different SKU.'
      });
    }
    
    res.status(500).json({
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting product:', id);

    // Find shop and verify ownership
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const product = await Product.findOne({ _id: id, shopId: shop._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    await Product.findByIdAndDelete(id);

    // Update shop's product count
    await Shop.findByIdAndUpdate(shop._id, {
      $inc: { totalProducts: -1 }
    });

    console.log('✅ Product deleted successfully');

    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update product status
exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Find shop and verify ownership
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const product = await Product.findOne({ _id: id, shopId: shop._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    product.isActive = isActive;
    await product.save();

    res.json({ 
      success: true,
      message: 'Product status updated successfully',
      isActive: product.isActive
    });

  } catch (error) {
    console.error('❌ Error updating product status:', error);
    res.status(500).json({
      message: 'Failed to update product status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all products (public)
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Category filter
    if (req.query.categories) {
      const categoryIds = req.query.categories.split(',');
      query.category = { $in: categoryIds };
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'rating_desc':
          sort = { rating: -1 };
          break;
        case 'popular':
          sort = { rating: -1, createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('shopId', 'shopName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products: products,
      total: total,
      page: page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products',
      products: [],
      total: 0
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('shopId', 'shopName logo contact')
      .populate('reviews.userId', 'firstName lastName');

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      product: product
    });

  } catch (error) {
    console.error('❌ Error fetching product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid product ID' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product' 
    });
  }
};