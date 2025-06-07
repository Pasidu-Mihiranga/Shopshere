// server/app.js - COMPLETE SHOPSPHERE API WITH SHOP-BASED PRODUCT MANAGEMENT
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 Starting SHOPSPHERE API...');

const app = express();

const Cart = require('./models/Cart');
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
    salePrice: {
      type: Number,
      min: 0
    },
    category: {
      type: String,
      required: true
    },
    subCategory: {
      type: String,
      default: ''
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
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
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
    reviews: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: Number,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
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
  image: {
    type: String,
    default: ''
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Cart Schema
// const cartSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   items: [{
//     productId: {
//       type: String,
//       required: true
//     },
//     shopId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Shop',
//       required: true
//     },
//     name: String,
//     price: Number,
//     image: String,
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1
//     },
//     attributes: {
//       type: Map,
//       of: mongoose.Schema.Types.Mixed,
//       default: {}
//     }
//   }],
//   totalAmount: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: String,
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    },
    name: String,
    price: Number,
    quantity: Number,
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  billing: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    subtotal: Number,
    shipping: Number,
    discount: Number,
    total: Number
  },
  shipping: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    method: String,
    trackingNumber: String,
    estimatedDelivery: {
      from: Date,
      to: Date
    }
  },
  payment: {
    method: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Create Models
const User = mongoose.model('User', userSchema);
const Shop = mongoose.model('Shop', shopSchema);
const Category = mongoose.model('Category', categorySchema);
//const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);

console.log('✅ Database models created (User, Shop, Category, Cart, Order)');

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

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
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

// Shop owner middleware
const isShopOwner = (req, res, next) => {
  if (req.user.userType !== 'shop_owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Shop owner role required.'
    });
  }
  next();
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
// FILE UPLOAD CONFIGURATION
// ============================================================================

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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
let inMemoryCarts = [];
let inMemoryOrders = [];

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
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

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const cartRoutes = require('./routes/cartRoutes');

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

app.use('/api/cart', cartRoutes);
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
      categories: 'Product categories',
      carts: 'User shopping carts',
      orders: 'Order management'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health route accessed');
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isDatabaseConnected() ? 'Connected' : 'Disconnected'
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
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: {
        profile: 'GET /api/users/profile',
        addresses: 'GET /api/users/addresses'
      },
      products: {
        list: 'GET /api/products',
        shopProducts: 'GET /api/products/shop OR GET /api/products/shop/products',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      shop: {
        info: 'GET /api/shop/info',
        update: 'PUT /api/shop/info'
      },
      categories: 'GET /api/categories',
      cart: {
        get: 'GET /api/cart',
        addItem: 'POST /api/cart/items',
        updateItem: 'PUT /api/cart/items/:productId',
        removeItem: 'DELETE /api/cart/items/:productId',
        clear: 'DELETE /api/cart'
      },
      orders: {
        list: 'GET /api/orders',
        create: 'POST /api/orders',
        getById: 'GET /api/orders/:id'
      }
    }
  });
});

// ============================================================================
// AUTH ROUTES
// ============================================================================

// User Registration
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
      console.log('👤 User saved to database:', savedUser._id);
      
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
      }
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

// User Login
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
      }
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
// USER ROUTES
// ============================================================================

// Get current user profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
  console.log('✅ User profile route accessed');
  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      userType: req.user.userType,
      phoneNumber: req.user.phoneNumber,
      profileImage: req.user.profileImage
    }
  });
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  console.log('✅ Update user profile route accessed');
  
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    
    if (isDatabaseConnected()) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName, phoneNumber },
        { new: true, select: '-password' }
      );
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } else {
      // Update in memory
      const userIndex = inMemoryUsers.findIndex(u => u._id === req.user._id);
      if (userIndex !== -1) {
        inMemoryUsers[userIndex] = {
          ...inMemoryUsers[userIndex],
          firstName,
          lastName,
          phoneNumber
        };
        res.json({
          success: true,
          message: 'Profile updated successfully',
          user: inMemoryUsers[userIndex]
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get user addresses
app.get('/api/users/addresses', authenticateToken, async (req, res) => {
  console.log('✅ User addresses route accessed');
  
  try {
    if (isDatabaseConnected()) {
      const user = await User.findById(req.user._id);
      res.json({
        success: true,
        addresses: user.addresses || []
      });
    } else {
      const user = inMemoryUsers.find(u => u._id === req.user._id);
      res.json({
        success: true,
        addresses: user?.addresses || []
      });
    }
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
});

// Add user address
app.post('/api/users/addresses', authenticateToken, async (req, res) => {
  console.log('✅ Add user address route accessed');
  
  try {
    const addressData = req.body;
    
    if (isDatabaseConnected()) {
      const user = await User.findById(req.user._id);
      user.addresses.push(addressData);
      await user.save();
      
      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        address: user.addresses[user.addresses.length - 1]
      });
    } else {
      const userIndex = inMemoryUsers.findIndex(u => u._id === req.user._id);
      if (userIndex !== -1) {
        if (!inMemoryUsers[userIndex].addresses) {
          inMemoryUsers[userIndex].addresses = [];
        }
        const newAddress = {
          _id: Date.now().toString(),
          ...addressData
        };
        inMemoryUsers[userIndex].addresses.push(newAddress);
        
        res.status(201).json({
          success: true,
          message: 'Address added successfully',
          address: newAddress
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
});

// ============================================================================
// PRODUCTS ROUTES
// ============================================================================

// Get shop products (only for authenticated shop owner) - MUST BE BEFORE /api/products/:id
app.get('/api/products/shop', authenticateToken, isShopOwner, async (req, res) => {
  console.log('✅ Get shop products route accessed');
  
  try {
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
      
    } else {
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      if (userShop) {
        products = userShop.products || [];
        shopName = userShop.shopName;
      }
    }
    
    console.log(`📦 Found ${products.length} products in ${shopName}`);
    
    res.json({
      success: true,
      products: products,
      total: products.length,
      shopName: shopName,
      owner: `${req.user.firstName} ${req.user.lastName}`
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

// Alternative route for frontend that expects /api/products/shop/products
app.get('/api/products/shop/products', authenticateToken, isShopOwner, async (req, res) => {
  console.log('✅ Get shop products (nested route) accessed');
  
  try {
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
      
    } else {
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      if (userShop) {
        products = userShop.products || [];
        shopName = userShop.shopName;
      }
    }
    
    console.log(`📦 Found ${products.length} products in ${shopName} (nested route)`);
    
    res.json({
      success: true,
      products: products,
      total: products.length,
      shopName: shopName,
      owner: `${req.user.firstName} ${req.user.lastName}`
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

// Get all products (from all shops) - CORRECTED VERSION
app.get('/api/products', async (req, res) => {
  console.log('✅ Get all products route accessed');
  
  try {
    const { search, categories, minPrice, maxPrice, rating, sort, page = 1, limit = 12 } = req.query;
    let allProducts = [];
    
    if (isDatabaseConnected()) {
      // Get products from all shops in database
      const shops = await Shop.find().populate('ownerId', 'firstName lastName email');
      
      shops.forEach(shop => {
        shop.products.forEach(product => {
          if (product.isActive) {
            allProducts.push({
              ...product.toObject(),
              productId: product._id,
              shopId: shop._id,
              shopName: shop.shopName,
              ownerName: shop.ownerId ? 
                `${shop.ownerId.firstName} ${shop.ownerId.lastName}` : 
                'Unknown Owner'
            });
          }
        });
      });
      
    } else {
      // Fallback to mock data from memory
      inMemoryShops.forEach(shop => {
        const owner = inMemoryUsers.find(u => u._id === shop.ownerId);
        shop.products?.forEach(product => {
          if (product.isActive) {
            allProducts.push({
              ...product,
              productId: product._id,
              shopId: shop._id,
              shopName: shop.shopName,
              ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner'
            });
          }
        });
      });
    }
    
    console.log('🔍 Query params:', req.query);
    console.log('📦 All products before filtering:', allProducts.length);
    console.log('🏷️ Sample product categories:', allProducts.slice(0, 3).map(p => p.category));
    
    // Apply filters
    if (search) {
      const searchTerm = search.toLowerCase();
      allProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (categories) {
      console.log('🔍 Categories filter received:', categories);
      const categoryList = categories.split(',');
      console.log('🔍 Category list:', categoryList);
      
      if (categories) {
  console.log('🔍 Categories filter received:', categories);
  const categoryList = categories.split(',').map(id => id.trim());
  console.log('🔍 Category ID list:', categoryList);
  
  // FIXED: Filter by IDs directly, don't convert to names
  allProducts = allProducts.filter(product => {
    const match = categoryList.includes(product.category.toString());
    if (match) {
      console.log(`✅ Product "${product.name}" matches category filter`);
    } else {
      console.log(`❌ Product "${product.name}" category "${product.category}" not in filter list`);
    }
    return match;
  });
  
  console.log('📦 Products after category filtering:', allProducts.length);
}
      
      console.log('📦 Products after category filtering:', allProducts.length);
    }
    
    if (minPrice) {
      allProducts = allProducts.filter(product => 
        (product.salePrice || product.price) >= parseFloat(minPrice)
      );
    }
    
    if (maxPrice) {
      allProducts = allProducts.filter(product => 
        (product.salePrice || product.price) <= parseFloat(maxPrice)
      );
    }
    
    if (rating) {
      allProducts = allProducts.filter(product => 
        product.rating >= parseFloat(rating)
      );
    }
    
    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'price_asc':
          allProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
          break;
        case 'price_desc':
          allProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
          break;
        case 'rating_desc':
          allProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
        default:
          allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    console.log(`📦 Found ${allProducts.length} products, returning ${paginatedProducts.length}`);
    
    res.json({
      success: true,
      products: paginatedProducts,
      total: allProducts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(allProducts.length / limit)
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

// Get single product by ID (MUST BE AFTER /api/products/shop to avoid conflicts)
app.get('/api/products/shop/:id', async (req, res) => {
  console.log('✅ Get product by ID route accessed');
  const productId = req.params.id;
  console.log('📦 Product ID received:', productId);

  try {
    const productId = req.params.id;
    let foundProduct = null;
    
    if (isDatabaseConnected()) {
      const shops = await Shop.find().populate('ownerId', 'firstName lastName email');
      console.log('🛒 Shops found:', shops.length);
      for (const shop of shops) {
        console.log('🔍 Checking shop:', shop.shopName);
  console.log('📦 Products:', shop.products);
  const product = shop.products.id(productId);
        
        if (product) {
          console.log('✅ Product found:', product.name);
          foundProduct = {
            ...product.toObject(),
            productId: product._id,
            shopId: shop._id,
            shopName: shop.shopName,
            ownerName: shop.ownerId ? 
              `${shop.ownerId.firstName} ${shop.ownerId.lastName}` : 
              'Unknown Owner'
          };
          break;
        }
      }
    } else {
      for (const shop of inMemoryShops) {
        const product = shop.products?.find(p => p._id === productId);
        if (product) {
          const owner = inMemoryUsers.find(u => u._id === shop.ownerId);
          foundProduct = {
            ...product,
            productId: product._id,
            shopId: shop._id,
            shopName: shop.shopName,
            ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner'
          };
          break;
        }
      }
    }
    
    if (!foundProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product: foundProduct
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Create new product (with image upload)
app.post('/api/products', authenticateToken, isShopOwner, upload.array('images', 5), async (req, res) => {
  console.log('✅ Create product route accessed');
  
  try {
    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, and category are required'
      });
    }
    
    // Process uploaded images
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : undefined,
      category: req.body.category,
      subCategory: req.body.subCategory || '',
      inventory: {
        quantity: parseInt(req.body.quantity) || 0,
        sku: req.body.sku || `SKU-${Date.now()}`
      },
      images: imageUrls,
      attributes: req.body.attributes ? JSON.parse(req.body.attributes) : {},
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
      isPromoted: req.body.isPromoted === 'true' || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let savedProduct;
    let shopName = '';
    
    if (isDatabaseConnected()) {
      const shop = await getOrCreateUserShop(req.user._id, req.user);
      
      if (!shop) {
        return res.status(500).json({
          success: false,
          message: 'Could not find or create user shop'
        });
      }
      
      shop.products.push(productData);
      const updatedShop = await shop.save();
      
      savedProduct = updatedShop.products[updatedShop.products.length - 1];
      shopName = shop.shopName;
      
    } else {
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
    }
    
    console.log(`🏪 Product created in ${shopName}:`, savedProduct._id);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
      shopName: shopName
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

// Update product
app.put('/api/products/:id', authenticateToken, isShopOwner, upload.array('images', 5), async (req, res) => {
  console.log('✅ Update product route accessed');
  
  try {
    const productId = req.params.id;
    
    if (isDatabaseConnected()) {
      const shop = await Shop.findOne({ 
        ownerId: req.user._id,
        'products._id': productId 
      });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      const product = shop.products.id(productId);
      
      // Update product fields
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price ? parseFloat(req.body.price) : product.price;
      product.salePrice = req.body.salePrice ? parseFloat(req.body.salePrice) : product.salePrice;
      product.category = req.body.category || product.category;
      product.subCategory = req.body.subCategory || product.subCategory;
      product.inventory.quantity = req.body.quantity ? parseInt(req.body.quantity) : product.inventory.quantity;
      product.inventory.sku = req.body.sku || product.inventory.sku;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive === 'true' : product.isActive;
      product.isPromoted = req.body.isPromoted !== undefined ? req.body.isPromoted === 'true' : product.isPromoted;
      product.updatedAt = new Date();
      
      // Process new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
        product.images = newImageUrls;
      }
      
      // Update attributes if provided
      if (req.body.attributes) {
        product.attributes = JSON.parse(req.body.attributes);
      }
      
      await shop.save();
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        product: product
      });
      
    } else {
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      const productIndex = userShop.products.findIndex(p => p._id === productId);
      if (productIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      // Process new images if uploaded
      let imageUrls = userShop.products[productIndex].images;
      if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      }
      
      userShop.products[productIndex] = {
        ...userShop.products[productIndex],
        ...req.body,
        images: imageUrls,
        attributes: req.body.attributes ? JSON.parse(req.body.attributes) : userShop.products[productIndex].attributes,
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        product: userShop.products[productIndex]
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

// Delete product
app.delete('/api/products/:id', authenticateToken, isShopOwner, async (req, res) => {
  console.log('✅ Delete product route accessed');
  
  try {
    const productId = req.params.id;
    
    if (isDatabaseConnected()) {
      const shop = await Shop.findOne({ 
        ownerId: req.user._id,
        'products._id': productId 
      });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      shop.products.id(productId).deleteOne();
      await shop.save();
      
    } else {
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      const productIndex = userShop.products.findIndex(p => p._id === productId);
      if (productIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      userShop.products.splice(productIndex, 1);
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      productId: productId
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

// Update product status
app.patch('/api/products/:id/status', authenticateToken, isShopOwner, async (req, res) => {
  console.log('✅ Update product status route accessed');
  
  try {
    const productId = req.params.id;
    const { isActive } = req.body;
    
    if (isDatabaseConnected()) {
      const shop = await Shop.findOne({ 
        ownerId: req.user._id,
        'products._id': productId 
      });
      
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      const product = shop.products.id(productId);
      product.isActive = isActive;
      product.updatedAt = new Date();
      
      await shop.save();
      
    } else {
      const userShop = inMemoryShops.find(shop => shop.ownerId === req.user._id);
      
      if (!userShop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found for this user'
        });
      }
      
      const product = userShop.products.find(p => p._id === productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your shop'
        });
      }
      
      product.isActive = isActive;
    }
    
    res.json({
      success: true,
      message: 'Product status updated successfully',
      productId: productId,
      isActive: isActive
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

// ============================================================================
// SHOP ROUTES
// ============================================================================

// Get shop info
app.get('/api/shop/info', authenticateToken, isShopOwner, async (req, res) => {
  console.log('✅ Get shop info route accessed');
  
  try {
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
        businessInfo: shop.businessInfo,
        isVerified: shop.isVerified,
        rating: shop.rating,
        productCount: shop.products?.length || 0,
        owner: {
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email
        }
      }
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
app.put('/api/shop/info', authenticateToken, isShopOwner, upload.single('logo'), async (req, res) => {
  console.log('✅ Update shop info route accessed');
  
  try {
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
      if (req.file) shop.logo = `/uploads/${req.file.filename}`;
      if (req.body.contact) shop.contact = { ...shop.contact, ...JSON.parse(req.body.contact) };
      if (req.body.address) shop.address = { ...shop.address, ...JSON.parse(req.body.address) };
      if (req.body.businessInfo) shop.businessInfo = { ...shop.businessInfo, ...JSON.parse(req.body.businessInfo) };
      
      await shop.save();
      
      res.json({
        success: true,
        message: 'Shop information updated successfully',
        shop: shop
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
      Object.assign(userShop, {
        ...req.body,
        logo: req.file ? `/uploads/${req.file.filename}` : userShop.logo,
        contact: req.body.contact ? JSON.parse(req.body.contact) : userShop.contact,
        address: req.body.address ? JSON.parse(req.body.address) : userShop.address,
        businessInfo: req.body.businessInfo ? JSON.parse(req.body.businessInfo) : userShop.businessInfo
      });
      
      res.json({
        success: true,
        message: 'Shop information updated successfully',
        shop: userShop
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
    } else {
      categories = inMemoryCategories;
    }

    res.json({
      success: true,
      categories: categories
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

// Add this to your app.js after your existing product routes

// Get products by category - Simple endpoint
// Replace the entire endpoint in your app.js with this fixed version:

// Get products by category - Fixed endpoint
app.get('/api/products/category/:categoryId', async (req, res) => {
  console.log('✅ Get products by category (simple) route accessed');
  
  try {
    const categoryId = req.params.categoryId;
    const { page = 1, limit = 12, sort = 'newest' } = req.query;
    
    console.log('🔍 Category ID:', categoryId);
    
    // Find category name for response (optional, just for display)
    let categoryName = null;
    
    if (isDatabaseConnected()) {
      try {
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          });
        }
        categoryName = category.name;
        console.log('🔍 Category name found:', categoryName);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    } else {
      const category = inMemoryCategories.find(cat => cat._id === categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      categoryName = category.name;
    }
    
    // Get products for this category - FIXED: Compare IDs with IDs
    let categoryProducts = [];
    
    if (isDatabaseConnected()) {
      const shops = await Shop.find().populate('ownerId', 'firstName lastName email');
      
      shops.forEach(shop => {
        shop.products.forEach(product => {
          // 🔧 FIXED: Compare category ID with category ID (not name)
          if (product.isActive && product.category.toString() === categoryId) {
            console.log(`✅ Found matching product: "${product.name}" with category ID: ${product.category}`);
            categoryProducts.push({
              ...product.toObject(),
              productId: product._id,
              shopId: shop._id,
              shopName: shop.shopName,
              categoryName: categoryName, // Add category name for display
              ownerName: shop.ownerId ? 
                `${shop.ownerId.firstName} ${shop.ownerId.lastName}` : 
                'Unknown Owner'
            });
          }
        });
      });
    } else {
      inMemoryShops.forEach(shop => {
        const owner = inMemoryUsers.find(u => u._id === shop.ownerId);
        shop.products?.forEach(product => {
          // 🔧 FIXED: Compare category ID with category ID (not name)
          if (product.isActive && product.category === categoryId) {
            console.log(`✅ Found matching product: "${product.name}" with category ID: ${product.category}`);
            categoryProducts.push({
              ...product,
              productId: product._id,
              shopId: shop._id,
              shopName: shop.shopName,
              categoryName: categoryName, // Add category name for display
              ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner'
            });
          }
        });
      });
    }
    
    // Apply sorting
    switch (sort) {
      case 'price_asc':
        categoryProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price_desc':
        categoryProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating_desc':
        categoryProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        categoryProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = categoryProducts.slice(startIndex, endIndex);
    
    console.log(`📦 Found ${categoryProducts.length} products in category "${categoryName}"`);
    
    res.json({
      success: true,
      category: {
        id: categoryId,
        name: categoryName
      },
      products: paginatedProducts,
      total: categoryProducts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(categoryProducts.length / limit)
    });
    
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message
    });
  }
});

app.use('/api/cart', cartRoutes);
// Also check if you have similar logic in the main products endpoint in app.js
// Look for any other places that do: product.category === categoryName
// And change them to: product.category.toString() === categoryId

// ============================================================================
// CART ROUTES
// ============================================================================

// Get user cart
// app.get('/api/cart', authenticateToken, async (req, res) => {
//   console.log('✅ Get cart route accessed');
  
//   try {
//     let cart;
    
//     if (isDatabaseConnected()) {
//       cart = await Cart.findOne({ userId: req.user._id });
      
//       if (!cart) {
//         cart = new Cart({
//           userId: req.user._id,
//           items: [],
//           totalAmount: 0
//         });
//         await cart.save();
//       }
//     } else {
//       cart = inMemoryCarts.find(c => c.userId === req.user._id);
      
//       if (!cart) {
//         cart = {
//           _id: Date.now().toString(),
//           userId: req.user._id,
//           items: [],
//           totalAmount: 0
//         };
//         inMemoryCarts.push(cart);
//       }
//     }
    
//     res.json({
//       success: true,
//       items: cart.items,
//       totalAmount: cart.totalAmount,
//       totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
//     });
    
//   } catch (error) {
//     console.error('Error fetching cart:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch cart',
//       error: error.message
//     });
//   }
// });

// // Add item to cart
// app.post('/api/cart/items', authenticateToken, async (req, res) => {
//   console.log('✅ Add to cart route accessed');
  
//   try {
//     const { productId, shopId, quantity, attributes } = req.body;
    
//     // Find the product to get current details
//     let productDetails = null;
    
//     if (isDatabaseConnected()) {
//       const shop = await Shop.findById(shopId);
//       if (shop) {
//         productDetails = shop.products.id(productId);
//       }
//     } else {
//       const shop = inMemoryShops.find(s => s._id === shopId);
//       if (shop) {
//         productDetails = shop.products.find(p => p._id === productId);
//       }
//     }
    
//     if (!productDetails) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }
    
//     const itemData = {
//       productId,
//       shopId,
//       name: productDetails.name,
//       price: productDetails.salePrice || productDetails.price,
//       image: productDetails.images[0] || '',
//       quantity: parseInt(quantity),
//       attributes: attributes || {}
//     };
    
//     if (isDatabaseConnected()) {
//       let cart = await Cart.findOne({ userId: req.user._id });
      
//       if (!cart) {
//         cart = new Cart({
//           userId: req.user._id,
//           items: [],
//           totalAmount: 0
//         });
//       }
      
//       // Check if item already exists
//       const existingItemIndex = cart.items.findIndex(item => 
//         item.productId === productId && 
//         JSON.stringify(item.attributes) === JSON.stringify(attributes || {})
//       );
      
//       if (existingItemIndex >= 0) {
//         cart.items[existingItemIndex].quantity += parseInt(quantity);
//       } else {
//         cart.items.push(itemData);
//       }
      
//       // Recalculate total
//       cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
//       await cart.save();
      
//     } else {
//       let cart = inMemoryCarts.find(c => c.userId === req.user._id);
      
//       if (!cart) {
//         cart = {
//           _id: Date.now().toString(),
//           userId: req.user._id,
//           items: [],
//           totalAmount: 0
//         };
//         inMemoryCarts.push(cart);
//       }
      
//       // Check if item already exists
//       const existingItemIndex = cart.items.findIndex(item => 
//         item.productId === productId && 
//         JSON.stringify(item.attributes) === JSON.stringify(attributes || {})
//       );
      
//       if (existingItemIndex >= 0) {
//         cart.items[existingItemIndex].quantity += parseInt(quantity);
//       } else {
//         cart.items.push({
//           ...itemData,
//           _id: Date.now().toString()
//         });
//       }
      
//       // Recalculate total
//       cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//     }
    
//     res.status(201).json({
//       success: true,
//       message: 'Item added to cart successfully',
//       item: itemData
//     });
    
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add item to cart',
//       error: error.message
//     });
//   }
// });

// // Update cart item quantity
// app.put('/api/cart/items/:productId', authenticateToken, async (req, res) => {
//   console.log('✅ Update cart item route accessed');
  
//   try {
//     const { productId } = req.params;
//     const { quantity, attributes } = req.body;
    
//     if (isDatabaseConnected()) {
//       const cart = await Cart.findOne({ userId: req.user._id });
      
//       if (!cart) {
//         return res.status(404).json({
//           success: false,
//           message: 'Cart not found'
//         });
//       }
      
//       const itemIndex = cart.items.findIndex(item => 
//         item.productId === productId && 
//         JSON.stringify(item.attributes) === JSON.stringify(attributes || {})
//       );
      
//       if (itemIndex === -1) {
//         return res.status(404).json({
//           success: false,
//           message: 'Item not found in cart'
//         });
//       }
      
//       cart.items[itemIndex].quantity = parseInt(quantity);
//       cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
//       await cart.save();
      
//     } else {
//       const cart = inMemoryCarts.find(c => c.userId === req.user._id);
      
//       if (!cart) {
//         return res.status(404).json({
//           success: false,
//           message: 'Cart not found'
//         });
//       }
      
//       const itemIndex = cart.items.findIndex(item => 
//         item.productId === productId && 
//         JSON.stringify(item.attributes) === JSON.stringify(attributes || {})
//       );
      
//       if (itemIndex === -1) {
//         return res.status(404).json({
//           success: false,
//           message: 'Item not found in cart'
//         });
//       }
      
//       cart.items[itemIndex].quantity = parseInt(quantity);
//       cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//     }
    
//     res.json({
//       success: true,
//       message: 'Cart item updated successfully'
//     });
    
//   } catch (error) {
//     console.error('Error updating cart item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update cart item',
//       error: error.message
//     });
//   }
// });

// // Remove item from cart
// app.delete('/api/cart/items/:productId', authenticateToken, async (req, res) => {
//   console.log('✅ Remove cart item route accessed');
  
//   try {
//     const { productId } = req.params;
//     const { attributes } = req.body;
    
//     if (isDatabaseConnected()) {
//       const cart = await Cart.findOne({ userId: req.user._id });
      
//       if (!cart) {
//         return res.status(404).json({
//           success: false,
//           message: 'Cart not found'
//         });
//       }
      
//       cart.items = cart.items.filter(item => 
//         !(item.productId === productId && 
//           JSON.stringify(item.attributes) === JSON.stringify(attributes || {}))
//       );
      
//       cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
//       await cart.save();
      
//     } else {
//       const cart = inMemoryCarts.find(c => c.userId === req.user._id);
      
//       if (!cart) {
//         return res.status(404).json({
//           success: false,
//           message: 'Cart not found'
//         });
//       }
      
//       cart.items = cart.items.filter(item => 
//         !(item.productId === productId && 
//           JSON.stringify(item.attributes) === JSON.stringify(attributes || {}))
//       );
      
//       cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//     }
    
//     res.json({
//       success: true,
//       message: 'Item removed from cart successfully'
//     });
    
//   } catch (error) {
//     console.error('Error removing cart item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to remove cart item',
//       error: error.message
//     });
//   }
// });

// // Clear cart
// app.delete('/api/cart', authenticateToken, async (req, res) => {
//   console.log('✅ Clear cart route accessed');
  
//   try {
//     if (isDatabaseConnected()) {
//       await Cart.findOneAndUpdate(
//         { userId: req.user._id },
//         { items: [], totalAmount: 0 },
//         { upsert: true }
//       );
//     } else {
//       const cartIndex = inMemoryCarts.findIndex(c => c.userId === req.user._id);
//       if (cartIndex !== -1) {
//         inMemoryCarts[cartIndex].items = [];
//         inMemoryCarts[cartIndex].totalAmount = 0;
//       }
//     }
    
//     res.json({
//       success: true,
//       message: 'Cart cleared successfully'
//     });
    
//   } catch (error) {
//     console.error('Error clearing cart:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to clear cart',
//       error: error.message
//     });
//   }
// });

// ============================================================================
// ORDER ROUTES
// ============================================================================

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  console.log('✅ Get orders route accessed');
  
  try {
    let orders;
    
    if (isDatabaseConnected()) {
      orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    } else {
      orders = inMemoryOrders.filter(order => order.userId === req.user._id);
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    res.json({
      success: true,
      orders: orders
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Create new order
// Create new order
// Create new order
app.post('/api/orders', authenticateToken, async (req, res) => {
  console.log('✅ Create order route accessed');
  
  try {
    const { addressId, items, payment, shipping, billing } = req.body;
    
    // Handle shipping address - either from saved address or direct input
    let shippingAddress;
    
    if (addressId) {
      // Using saved address
      if (isDatabaseConnected()) {
        const user = await User.findById(req.user._id);
        shippingAddress = user.addresses.id(addressId);
      } else {
        const user = inMemoryUsers.find(u => u._id === req.user._id);
        shippingAddress = user?.addresses?.find(addr => addr._id === addressId);
      }
      
      if (!shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Invalid address'
        });
      }
    } else if (shipping && shipping.address) {
      // Using direct shipping info from checkout form
      shippingAddress = shipping.address;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address'
      });
    }
    // Calculate totals
// Calculate totals - use provided billing info or calculate defaults
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = billing?.shipping || (subtotal > 50 ? 0 : 2.25);
    const tax = billing?.tax || (subtotal * 0.07);
    const discount = billing?.discount || 0;
    const total = billing?.total || (subtotal + shippingCost + tax - discount);
    
    const orderData = {
      orderNumber: generateOrderNumber(),
      userId: req.user._id,
      items: items.map(item => ({
        ...item,
        image: item.image || ''
      })),
      billing: {
        address: billing?.address || shippingAddress,
        subtotal,
        shipping: shippingCost,
        tax,
        discount,
        total
      },
      shipping: {
        address: shippingAddress,
        method: shipping?.method || 'Standard Shipping',
        cost: shippingCost,
        estimatedDelivery: {
          from: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)    // 7 days from now
        }
      },
      payment: {
        method: payment?.method || 'card',
        transactionId: payment?.transactionId,
        status: payment?.status || 'pending',
        details: payment?.details || {}
      },
      // Store shipping info directly for easy access in order confirmation
      shippingInfo: shippingAddress
    };
    
    let savedOrder;
    
    if (isDatabaseConnected()) {
      const newOrder = new Order(orderData);
      savedOrder = await newOrder.save();
      
      // Clear user's cart
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], totalAmount: 0 }
      );
      
    } else {
      savedOrder = {
        _id: Date.now().toString(),
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      inMemoryOrders.push(savedOrder);
      
      // Clear user's cart
      const cartIndex = inMemoryCarts.findIndex(c => c.userId === req.user._id);
      if (cartIndex !== -1) {
        inMemoryCarts[cartIndex].items = [];
        inMemoryCarts[cartIndex].totalAmount = 0;
      }
    }
    
    console.log(`📦 Order created: ${savedOrder.orderNumber}`);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get order by ID
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  console.log('✅ Get order by ID route accessed');
  
  try {
    const orderId = req.params.id;
    let order;
    
    if (isDatabaseConnected()) {
      order = await Order.findOne({ _id: orderId, userId: req.user._id });
    } else {
      order = inMemoryOrders.find(o => o._id === orderId && o.userId === req.user._id);
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order: order
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global Error Handler:', error);
  
  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum 5 images allowed.'
    });
  }
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error response
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack 
    })
  });
});

console.log('✅ All routes configured successfully');
console.log('📊 Database collections: users, shops, categories, carts, orders');
console.log('🏪 Products are stored in individual shops collection');
console.log('👤 User registration saves to users collection');
console.log('🔐 Authentication required for shop-specific operations');
console.log('🛡️ Shop owners can only manage their own products');
console.log('📦 Complete cart and order management implemented');
console.log('📁 File upload support for product images and shop logos');

// Export the app (server.js will handle the listening)
module.exports = app;