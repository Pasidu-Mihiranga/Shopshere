// server/app.js - WITH SHOP-BASED PRODUCT MANAGEMENT
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🚀 Starting SHOPSPHERE API...');

const app = express();

// ============================================================================
// DATABASE MODELS/SCHEMAS
// ============================================================================

// User Schema (for registration and login)
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['customer', 'shop_owner'],
    default: 'customer'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  addresses: [{
    addressType: {
      type: String,
      enum: ['shipping', 'billing'],
      default: 'shipping'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  authProvider: {
    type: {
      type: String,
      enum: ['local', 'google', 'facebook', 'apple'],
      default: 'local'
    },
    providerId: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Shop Schema (for products - storing products in shops collection)
const shopSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensure one shop per owner
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  contact: {
    email: String,
    phone: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  businessInfo: {
    registrationNumber: String,
    taxId: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Products will be stored in this shop
  products: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true
    },
    inventory: {
      quantity: {
        type: Number,
        default: 0,
        min: 0
      },
      sku: {
        type: String,
        default: ''
      }
    },
    images: [{
      type: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    isPromoted: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create Models
const User = mongoose.model('User', userSchema);
const Shop = mongoose.model('Shop', shopSchema);
const Category = mongoose.model('Category', categorySchema);

console.log('✅ Database models created (User, Shop, Category)');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Find user
    let user;
    if (isDatabaseConnected()) {
      user = await User.findById(decoded.userId).select('-password');
    } else {
      user = inMemoryUsers.find(u => u._id === decoded.userId);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get or create shop for user
const getOrCreateUserShop = async (userId, userInfo = null) => {
  try {
    let shop = await Shop.findOne({ ownerId: userId });
    
    if (!shop) {
      // Create a new shop for this user
      const shopName = userInfo ? 
        `${userInfo.firstName}'s Shop` : 
        `Shop-${userId.toString().slice(-6)}`;
        
      shop = new Shop({
        ownerId: userId,
        shopName: shopName,
        description: `Welcome to ${shopName}`,
        contact: {
          email: userInfo?.email || '',
          phone: ''
        },
        products: []
      });
      
      await shop.save();
      console.log(`🏪 Created new shop for user ${userId}: ${shopName}`);
    }
    
    return shop;
  } catch (error) {
    console.error('Error getting/creating user shop:', error);
    return null;
  }
};

// ============================================================================
// IN-MEMORY FALLBACK STORAGE
// ============================================================================

let inMemoryUsers = [];
let inMemoryShops = [];
let inMemoryCategories = [
  { _id: '1', name: 'Electronics', description: 'Electronic items', isActive: true },
  { _id: '2', name: 'Clothing', description: 'Clothing items', isActive: true },
  { _id: '3', name: 'Books', description: 'Books and literature', isActive: true },
  { _id: '4', name: 'Home & Garden', description: 'Home and garden items', isActive: true },
  { _id: '5', name: 'Sports', description: 'Sports equipment', isActive: true }
];

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);
  next();
});

console.log('✅ Middleware configured');

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsphere', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB connected successfully to: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Retrying database connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Connect to database
connectDB();

// ============================================================================
// CORE ROUTES
// ============================================================================

// Root endpoint
app.get('/', (req, res) => {
  console.log('✅ Root route accessed');
  res.json({
    message: 'Welcome to SHOPSPHERE API',
    version: '1.0.0',
    status: 'Server is running',
    database: isDatabaseConnected() ? 'Connected' : 'Disconnected (using fallback)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    collections: {
      users: 'User registration and authentication',
      shops: 'Shop data with embedded products (one shop per owner)',
      categories: 'Product categories'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  console.log('✅ API endpoint accessed');
  res.json({
    message: 'SHOPSPHERE API',
    version: '1.0.0',
    status: 'online',
    database: isDatabaseConnected() ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register - Save to users collection',
        login: 'POST /api/auth/login - Authenticate user'
      },
      products: {
        list: 'GET /api/products - Get products from all shops',
        shopProducts: 'GET /api/products/shop - Get products from authenticated user\'s shop',
        create: 'POST /api/products - Save to authenticated user\'s shop',
        update: 'PUT /api/products/:id - Update in authenticated user\'s shop',
        delete: 'DELETE /api/products/:id - Delete from authenticated user\'s shop'
      },
      categories: 'GET /api/categories',
      health: 'GET /api/health'
    }
  });
});

// ============================================================================
// HEALTH ROUTES
// ============================================================================

app.get('/api/health', (req, res) => {
  console.log('✅ Health route accessed');
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDatabaseConnected() ? 'Connected' : 'Disconnected'
  });
});

// ============================================================================
// AUTH ROUTES (REAL USER REGISTRATION AND LOGIN)
// ============================================================================

// User Registration (SAVES TO USERS COLLECTION)
app.post('/api/auth/register', async (req, res) => {
  console.log('✅ Register route accessed');
  console.log('Registration data:', { ...req.body, password: '[HIDDEN]' });
  
  try {
    const { email, password, firstName, lastName, userType } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, firstName, and lastName are required'
      });
    }
    
    let savedUser;
    
    if (isDatabaseConnected()) {
      // Check if user already exists in database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create and save user to database
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType: userType || 'customer'
      });
      
      savedUser = await newUser.save();
      console.log('👤 User saved to database (users collection):', savedUser._id);
      
      // If user is a shop owner, create their shop
      if (savedUser.userType === 'shop_owner') {
        const shop = await getOrCreateUserShop(savedUser._id, savedUser);
        console.log('🏪 Shop created for new shop owner:', shop?.shopName);
      }
      
    } else {
      // Save to memory
      const existingUser = inMemoryUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      
      savedUser = {
        _id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password: await hashPassword(password),
        userType: userType || 'customer',
        createdAt: new Date().toISOString()
      };
      
      inMemoryUsers.push(savedUser);
      console.log('👤 User saved to memory:', savedUser._id);
      
      // If user is a shop owner, create their shop in memory
      if (savedUser.userType === 'shop_owner') {
        const newShop = {
          _id: `shop-${savedUser._id}`,
          ownerId: savedUser._id,
          shopName: `${savedUser.firstName}'s Shop`,
          description: `Welcome to ${savedUser.firstName}'s Shop`,
          products: []
        };
        inMemoryShops.push(newShop);
        console.log('🏪 Shop created in memory for new shop owner:', newShop.shopName);
      }
    }
    
    // Generate token
    const token = generateToken(savedUser._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        userType: savedUser.userType
      },
      savedTo: isDatabaseConnected() ? 'database (users collection)' : 'memory',
      shopCreated: savedUser.userType === 'shop_owner'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// User Login (AUTHENTICATES FROM USERS COLLECTION)
app.post('/api/auth/login', async (req, res) => {
  console.log('✅ Login route accessed');
  console.log('Login attempt:', { email: req.body.email, userType: req.body.userType });
  
  try {
    const { email, password, userType } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    let user;
    
    if (isDatabaseConnected()) {
      // Find user in database
      user = await User.findOne({ email });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check password
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      console.log('👤 User authenticated from database:', user._id);
      
    } else {
      // Find user in memory
      user = inMemoryUsers.find(u => u.email === email);
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      console.log('👤 User authenticated from memory:', user._id);
    }
    
    // Check user type if specified
    if (userType && user.userType !== userType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      },
      authenticatedFrom: isDatabaseConnected() ? 'database (users collection)' : 'memory'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// ============================================================================
// PRODUCTS ROUTES (SHOP-SPECIFIC)
// ============================================================================

// Get all products (FROM ALL SHOPS COLLECTION) - For customers browsing
app.get('/api/products', async (req, res) => {
  console.log('✅ Get all products route accessed');
  
  try {
    let allProducts = [];
    
    if (isDatabaseConnected()) {
      // Get products from all shops in database
      const shops = await Shop.find().populate('ownerId', 'firstName lastName email');
      
      shops.forEach(shop => {
        shop.products.forEach(product => {
          allProducts.push({
            ...product.toObject(),
            shopId: shop._id,
            shopName: shop.shopName,
            ownerName: shop.ownerId ? 
              `${shop.ownerId.firstName} ${shop.ownerId.lastName}` : 
              'Unknown Owner'
          });
        });
      });
      
      console.log(`📦 Found ${allProducts.length} products from ${shops.length} shops in database`);
    } else {
      // Fallback to mock data from memory
      inMemoryShops.forEach(shop => {
        const owner = inMemoryUsers.find(u => u._id === shop.ownerId);
        shop.products?.forEach(product => {
          allProducts.push({
            ...product,
            shopId: shop._id,
            shopName: shop.shopName,
            ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner'
          });
        });
      });
      
      console.log(`📦 Found ${allProducts.length} products from ${inMemoryShops.length} shops in memory`);
    }
    
    res.json({
      success: true,
      products: allProducts,
      total: allProducts.length,
      source: isDatabaseConnected() ? 'database (all shops)' : 'memory'
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get shop products (ONLY FOR AUTHENTICATED SHOP OWNER)
app.get('/api/products/shop', authenticateToken, async (req, res) => {
  console.log('✅ Get shop products route accessed');
  console.log('User:', req.user.email, 'Type:', req.user.userType);
  
  try {
    // Check if user is shop owner
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owner role required.'
      });
    }
    
    let products = [];
    let shopName = '';
    
    if (isDatabaseConnected()) {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      products = shop.products;
      shopName = shop.shopName;
      console.log(`📦 Found ${products.length} products in ${shopName} for user ${req.user.email}`);
      
    } else {
      // Find user's shop in memory
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      if (userShop) {
        products = userShop.products || [];
        shopName = userShop.shopName;
      }
      console.log(`📦 Found ${products.length} products in memory shop for user ${req.user.email}`);
    }
    
    res.json({
      success: true,
      products: products,
      total: products.length,
      shopName: shopName,
      owner: `${req.user.firstName} ${req.user.lastName}`,
      source: isDatabaseConnected() ? 'database (user\'s shop)' : 'memory'
    });
    
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop products',
      error: error.message
    });
  }
});

// Create new product (SAVES TO AUTHENTICATED USER'S SHOP)
app.post('/api/products', authenticateToken, async (req, res) => {
  console.log('✅ Create product route accessed');
  console.log('User:', req.user.email, 'Type:', req.user.userType);
  console.log('Product data:', req.body);
  
  try {
    // Check if user is shop owner
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owner role required.'
      });
    }
    
    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, and category are required'
      });
    }
    
    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      category: req.body.category,
      inventory: {
        quantity: parseInt(req.body.quantity) || 0,
        sku: req.body.sku || `SKU-${Date.now()}`
      },
      images: req.body.images || [],
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      isPromoted: req.body.isPromoted || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let savedProduct;
    let shopName = '';
    
    if (isDatabaseConnected()) {
      // Get or create user's shop
      const shop = await getOrCreateUserShop(req.user._id, req.user);
      
      if (!shop) {
        return res.status(500).json({
          success: false,
          message: 'Could not find or create user shop'
        });
      }
      
      // Add product to user's shop
      shop.products.push(productData);
      const updatedShop = await shop.save();
      
      // Get the newly added product (last one in the array)
      savedProduct = updatedShop.products[updatedShop.products.length - 1];
      shopName = shop.shopName;
      
      console.log(`🏪 Product saved to ${shopName} (database) for user ${req.user.email}:`, savedProduct._id);
      
    } else {
      // Save to memory - find or create user's shop
      let userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        userShop = {
          _id: `shop-${req.user._id}`,
          ownerId: req.user._id,
          shopName: `${req.user.firstName}'s Shop`,
          description: `Welcome to ${req.user.firstName}'s Shop`,
          products: []
        };
        inMemoryShops.push(userShop);
      }
      
      savedProduct = {
        _id: Date.now().toString(),
        ...productData
      };
      
      userShop.products.push(savedProduct);
      shopName = userShop.shopName;
      console.log(`🏪 Product saved to ${shopName} (memory) for user ${req.user.email}:`, savedProduct._id);
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
      shopName: shopName,
      owner: `${req.user.firstName} ${req.user.lastName}`,
      savedTo: isDatabaseConnected() ? 'database (user\'s shop)' : 'memory'
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product (IN AUTHENTICATED USER'S SHOP ONLY)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  console.log('✅ Update product route accessed');
  console.log('User:', req.user.email, 'Product ID:', req.params.id);
  
  try {
    // Check if user is shop owner
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owner role required.'
      });
    }
    
    if (isDatabaseConnected()) {
      // Find user's shop and the specific product
      const shop = await Shop.findOne({ 
        ownerId: req.user._id,
        'products._id': req.params.id 
      });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      const product = shop.products.id(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Update product fields
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price ? parseFloat(req.body.price) : product.price;
      product.category = req.body.category || product.category;
      product.inventory.quantity = req.body.quantity ? parseInt(req.body.quantity) : product.inventory.quantity;
      product.inventory.sku = req.body.sku || product.inventory.sku;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
      product.isPromoted = req.body.isPromoted !== undefined ? req.body.isPromoted : product.isPromoted;
      product.updatedAt = new Date();
      
      await shop.save();
      
      console.log(`🏪 Product updated in ${shop.shopName} for user ${req.user.email}:`, product._id);
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        product: product,
        shopName: shop.shopName,
        updatedIn: 'database (user\'s shop)'
      });
      
    } else {
      // Update in memory - only in user's shop
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      const productIndex = userShop.products.findIndex(p => p._id === req.params.id);
      if (productIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      userShop.products[productIndex] = {
        ...userShop.products[productIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      console.log(`🏪 Product updated in ${userShop.shopName} for user ${req.user.email}:`, req.params.id);
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        product: userShop.products[productIndex],
        shopName: userShop.shopName,
        updatedIn: 'memory (user\'s shop)'
      });
    }
    
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product (FROM AUTHENTICATED USER'S SHOP ONLY)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  console.log('✅ Delete product route accessed');
  console.log('User:', req.user.email, 'Product ID:', req.params.id);
  
  try {
    // Check if user is shop owner
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owner role required.'
      });
    }
    
    if (isDatabaseConnected()) {
      // Find user's shop and remove the specific product
      const shop = await Shop.findOne({ 
        ownerId: req.user._id,
        'products._id': req.params.id 
      });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      shop.products.id(req.params.id).remove();
      await shop.save();
      
      console.log(`🗑️ Product deleted from ${shop.shopName} for user ${req.user.email}:`, req.params.id);
      
    } else {
      // Delete from memory - only from user's shop
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      const productIndex = userShop.products.findIndex(p => p._id === req.params.id);
      if (productIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      userShop.products.splice(productIndex, 1);
      console.log(`🗑️ Product deleted from ${userShop.shopName} for user ${req.user.email}:`, req.params.id);
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      productId: req.params.id,
      deletedFrom: isDatabaseConnected() ? 'database (user\'s shop)' : 'memory (user\'s shop)'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Update product status (IN AUTHENTICATED USER'S SHOP ONLY)
app.patch('/api/products/:id/status', authenticateToken, async (req, res) => {
  console.log('✅ Update product status route accessed');
  console.log('User:', req.user.email, 'Product ID:', req.params.id, 'New status:', req.body.isActive);
  
  try {
    // Check if user is shop owner
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owner role required.'
      });
    }
    
    if (isDatabaseConnected()) {
      const shop = await Shop.findOne({ 
        ownerId: req.user._id,
        'products._id': req.params.id 
      });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      const product = shop.products.id(req.params.id);
      product.isActive = req.body.isActive;
      product.updatedAt = new Date();
      
      await shop.save();
      
      console.log(`🔄 Product status updated in ${shop.shopName} for user ${req.user.email}:`, req.params.id);
      
    } else {
      // Update in memory - only in user's shop
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      const product = userShop.products.find(p => p._id === req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      product.isActive = req.body.isActive;
      console.log(`🔄 Product status updated in ${userShop.shopName} for user ${req.user.email}:`, req.params.id);
    }
    
    res.json({
      success: true,
      message: 'Product status updated successfully',
      productId: req.params.id,
      isActive: req.body.isActive,
      updatedIn: isDatabaseConnected() ? 'database (user\'s shop)' : 'memory (user\'s shop)'
    });
    
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status',
      error: error.message
    });
  }
});

// Get user's shop info
app.get('/api/shop/info', authenticateToken, async (req, res) => {
  console.log('✅ Get shop info route accessed');
  console.log('User:', req.user.email);
  
  try {
    // Check if user is shop owner
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owner role required.'
      });
    }
    
    let shop;
    
    if (isDatabaseConnected()) {
      shop = await Shop.findOne({ ownerId: req.user._id }).populate('ownerId', 'firstName lastName email');
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
    } else {
      shop = inMemoryShops.find(s => s.ownerId === req.user._id);
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
    }
    
    res.json({
      success: true,
      shop: {
        _id: shop._id,
        shopName: shop.shopName,
        description: shop.description,
        logo: shop.logo,
        contact: shop.contact,
        address: shop.address,
        isVerified: shop.isVerified,
        rating: shop.rating,
        productCount: shop.products?.length || 0,
        owner: {
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email
        }
      },
      source: isDatabaseConnected() ? 'database' : 'memory'
    });
    
  } catch (error) {
    console.error('Error fetching shop info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop info',
      error: error.message
    });
  }
});

// Update shop info
app.put('/api/shop/info', authenticateToken, async (req, res) => {
  console.log('✅ Update shop info route accessed');
  console.log('User:', req.user.email);
  
  try {
    // Check if user is shop owner
    if (req.user.userType !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owner role required.'
      });
    }
    
    if (isDatabaseConnected()) {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      // Update shop fields
      if (req.body.shopName) shop.shopName = req.body.shopName;
      if (req.body.description) shop.description = req.body.description;
      if (req.body.logo) shop.logo = req.body.logo;
      if (req.body.contact) shop.contact = { ...shop.contact, ...req.body.contact };
      if (req.body.address) shop.address = { ...shop.address, ...req.body.address };
      if (req.body.businessInfo) shop.businessInfo = { ...shop.businessInfo, ...req.body.businessInfo };
      
      await shop.save();
      
      console.log(`🏪 Shop info updated for user ${req.user.email}: ${shop.shopName}`);
      
      res.json({
        success: true,
        message: 'Shop information updated successfully',
        shop: shop,
        updatedIn: 'database'
      });
      
    } else {
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      // Update shop fields in memory
      Object.assign(userShop, req.body);
      
      res.json({
        success: true,
        message: 'Shop information updated successfully',
        shop: userShop,
        updatedIn: 'memory'
      });
    }
    
  } catch (error) {
    console.error('Error updating shop info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop info',
      error: error.message
    });
  }
});

// ============================================================================
// CATEGORIES ROUTES
// ============================================================================

app.get('/api/categories', async (req, res) => {
  console.log('✅ Categories route accessed');
  
  try {
    let categories;
    
    if (isDatabaseConnected()) {
      categories = await Category.find({ isActive: true });
      
      // Create default categories if none exist
      if (categories.length === 0) {
        const defaultCategories = [
          { name: 'Electronics', description: 'Electronic items' },
          { name: 'Clothing', description: 'Clothing items' },
          { name: 'Books', description: 'Books and literature' },
          { name: 'Home & Garden', description: 'Home and garden items' },
          { name: 'Sports', description: 'Sports equipment' }
        ];
        
        categories = await Category.insertMany(defaultCategories);
        console.log('📚 Created default categories in database');
      }
      console.log(`📚 Found ${categories.length} categories in database`);
    } else {
      categories = inMemoryCategories;
      console.log(`📚 Using ${categories.length} categories from memory`);
    }

    res.json({
      success: true,
      categories: categories,
      source: isDatabaseConnected() ? 'database' : 'memory'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// ============================================================================
// OTHER MOCK ROUTES (BASIC IMPLEMENTATIONS)
// ============================================================================

// User profile route
app.get('/api/users/profile', authenticateToken, (req, res) => {
  console.log('✅ User profile route accessed');
  res.json({
    success: true,
    message: 'User profile endpoint - implementation pending',
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      userType: req.user.userType
    }
  });
});

app.get('/api/users/addresses', authenticateToken, (req, res) => {
  console.log('✅ User addresses route accessed');
  res.json({
    success: true,
    message: 'User addresses endpoint - implementation pending',
    addresses: []
  });
});

// Cart routes
app.get('/api/cart', authenticateToken, (req, res) => {
  console.log('✅ Cart route accessed');
  res.json({
    success: true,
    items: [],
    totalAmount: 0,
    message: 'Cart endpoint - implementation pending'
  });
});

app.post('/api/cart/items', authenticateToken, (req, res) => {
  console.log('✅ Add to cart route accessed');
  res.json({
    success: true,
    message: 'Add to cart - implementation pending',
    item: req.body
  });
});

// Order routes
app.get('/api/orders', authenticateToken, (req, res) => {
  console.log('✅ Orders route accessed');
  res.json({
    success: true,
    orders: [],
    message: 'Orders endpoint - implementation pending'
  });
});

app.post('/api/orders', authenticateToken, (req, res) => {
  console.log('✅ Create order route accessed');
  res.json({
    success: true,
    message: 'Create order - implementation pending',
    order: {
      _id: 'mock_order_id',
      orderNumber: 'ORD-001',
      ...req.body
    }
  });
});

// Payment routes
app.post('/api/payments/create-intent', authenticateToken, (req, res) => {
  console.log('✅ Payment intent route accessed');
  res.json({
    success: true,
    message: 'Create payment intent - implementation pending',
    clientSecret: 'mock_client_secret'
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
});

// 404 handler - must be last
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Please check the URL and try again',
    availableEndpoints: {
      root: 'GET /',
      api: 'GET /api',
      health: 'GET /api/health',
      register: 'POST /api/auth/register (saves to users collection)',
      login: 'POST /api/auth/login (authenticates from users collection)',
      allProducts: 'GET /api/products (from all shops)',
      shopProducts: 'GET /api/products/shop (authenticated user\'s shop only)',
      createProduct: 'POST /api/products (saves to authenticated user\'s shop)',
      updateProduct: 'PUT /api/products/:id (updates in authenticated user\'s shop)',
      deleteProduct: 'DELETE /api/products/:id (deletes from authenticated user\'s shop)',
      shopInfo: 'GET /api/shop/info (authenticated user\'s shop info)',
      updateShop: 'PUT /api/shop/info (update authenticated user\'s shop)',
      categories: 'GET /api/categories'
    }
  });
});

console.log('✅ All routes configured successfully');
console.log('📊 Database collections: users, shops (one per owner), categories');
console.log('🏪 Products are stored in individual shops collection');
console.log('👤 User registration saves to users collection');
console.log('🔐 Authentication required for shop-specific operations');
console.log('🛡️ Shop owners can only manage their own products');

// Export the app (server.js will handle the listening)
module.exports = app;