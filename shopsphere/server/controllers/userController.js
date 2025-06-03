// server/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Placeholder for User model - replace with actual model when available
const User = {
  findOne: async (query) => {
    // Mock implementation
    return null;
  },
  create: async (userData) => {
    // Mock implementation
    return { _id: 'mock-id', ...userData };
  },
  findById: async (id) => {
    // Mock implementation
    return { _id: id, email: 'test@example.com', firstName: 'Test', lastName: 'User' };
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;

    console.log('Register attempt:', { email, userType });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType: userType || 'customer'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    console.log('Login attempt:', { email, userType });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check user type
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
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Profile update endpoint - implementation pending',
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Change password endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user addresses
exports.getUserAddresses = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get addresses endpoint - implementation pending',
      addresses: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add address
exports.addAddress = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Add address endpoint - implementation pending',
      address: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Update address endpoint - implementation pending',
      address: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Delete address endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Social login
exports.socialLogin = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Social login endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Forgot password endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Reset password endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};