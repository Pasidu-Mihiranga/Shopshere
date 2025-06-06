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

// Get all products (public) - COMPLETE FIXED FUNCTION
exports.getProducts = async (req, res) => {
  try {
    console.log('🔍 Product search request:', req.query);

    const {
      page = 1,
      limit = 12,
      sort = 'newest',
      search,
      categories, // This comes as comma-separated category IDs
      minPrice,
      maxPrice,
      rating
    } = req.query;

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build the filter object
    let query = { isActive: true };

    // Search filter
    if (search) {
      console.log('🔍 Search term:', search);
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter - FIXED VERSION
    if (categories) {
      console.log('🔍 Categories filter received:', categories);
      
      // Split comma-separated category IDs and trim whitespace
      const categoryIds = categories.split(',').map(id => id.trim());
      console.log('🔍 Category IDs for filtering:', categoryIds);
      
      // Filter by category IDs directly - NO conversion to names
      query.category = { $in: categoryIds };
      
      console.log('🔍 Final MongoDB filter for categories:', query.category);
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
        console.log('🔍 Min price filter:', minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
        console.log('🔍 Max price filter:', maxPrice);
      }
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
      console.log('🔍 Rating filter:', rating);
    }

    console.log('🔍 Final query object:', JSON.stringify(query, null, 2));

    // Sorting
    let sortQuery = {};
    switch (sort) {
      case 'price_asc':
        sortQuery = { price: 1 };
        break;
      case 'price_desc':
        sortQuery = { price: -1 };
        break;
      case 'rating_desc':
        sortQuery = { rating: -1 };
        break;
      case 'popular':
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    console.log('🔍 Sort query:', sortQuery);

    // Execute the query
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('shopId', 'shopName')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    console.log(`📦 Found ${products.length} products after filtering`);
    console.log(`📊 Total products matching filter: ${total}`);

    // Add category name to each product for frontend display
    const productsWithCategoryName = products.map(product => ({
      ...product.toObject(),
      categoryName: product.category?.name || 'Uncategorized',
      shopName: product.shopId?.shopName || 'Unknown Shop'
    }));

    res.json({
      success: true,
      products: productsWithCategoryName,
      total: total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      hasMore: skip + products.length < total
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
    
    console.log('🔍 Fetching product by ID:', id);
    
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('shopId', 'shopName logo contact')
      .populate('reviews.userId', 'firstName lastName');

    if (!product) {
      console.log('❌ Product not found:', id);
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    console.log('✅ Product found:', product.name);

    // Add category name for consistency
    const productWithCategoryName = {
      ...product.toObject(),
      categoryName: product.category?.name || 'Uncategorized',
      shopName: product.shopId?.shopName || 'Unknown Shop'
    };

    res.json({
      success: true,
      product: productWithCategoryName
    });

  } catch (error) {
    console.error('❌ Error fetching product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid product ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product' 
    });
  }
};

// Get products by category - Additional helper endpoint
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, sort = 'newest' } = req.query;

    console.log('🔍 Fetching products by category:', categoryId);

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const query = { 
      isActive: true, 
      category: categoryId 
    };

    // Sorting
    let sortQuery = {};
    switch (sort) {
      case 'price_asc': sortQuery = { price: 1 }; break;
      case 'price_desc': sortQuery = { price: -1 }; break;
      case 'rating_desc': sortQuery = { rating: -1 }; break;
      case 'popular': sortQuery = { rating: -1, createdAt: -1 }; break;
      case 'newest': default: sortQuery = { createdAt: -1 }; break;
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('shopId', 'shopName')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);

    const total = await Product.countDocuments(query);

    const productsWithCategoryName = products.map(product => ({
      ...product.toObject(),
      categoryName: product.category?.name || 'Uncategorized',
      shopName: product.shopId?.shopName || 'Unknown Shop'
    }));

    console.log(`✅ Found ${products.length} products in category: ${category.name}`);

    res.json({
      success: true,
      products: productsWithCategoryName,
      total: total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      category: {
        _id: category._id,
        name: category.name
      }
    });

  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category'
    });
  }
};

// Search products - Additional helper endpoint
exports.searchProducts = async (req, res) => {
  try {
    const { q: searchTerm, page = 1, limit = 12, sort = 'newest' } = req.query;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    console.log('🔍 Searching products for:', searchTerm);

    const query = {
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Sorting
    let sortQuery = {};
    switch (sort) {
      case 'price_asc': sortQuery = { price: 1 }; break;
      case 'price_desc': sortQuery = { price: -1 }; break;
      case 'rating_desc': sortQuery = { rating: -1 }; break;
      case 'popular': sortQuery = { rating: -1, createdAt: -1 }; break;
      case 'newest': default: sortQuery = { createdAt: -1 }; break;
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('shopId', 'shopName')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);

    const total = await Product.countDocuments(query);

    const productsWithCategoryName = products.map(product => ({
      ...product.toObject(),
      categoryName: product.category?.name || 'Uncategorized',
      shopName: product.shopId?.shopName || 'Unknown Shop'
    }));

    console.log(`✅ Found ${products.length} products for search: "${searchTerm}"`);

    res.json({
      success: true,
      products: productsWithCategoryName,
      total: total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      searchTerm: searchTerm
    });

  } catch (error) {
    console.error('❌ Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
};