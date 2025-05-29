// server/middleware/validationMiddleware.js
const { validationResult, check } = require('express-validator');

// Validation error handler
exports.validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// User registration validation
exports.validateRegistration = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  
  check('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  
  check('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  
  check('userType')
    .isIn(['customer', 'shop_owner'])
    .withMessage('Invalid user type')
];

// Product validation
exports.validateProduct = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  
  check('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  check('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  check('inventory.quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

// Order validation
exports.validateOrder = [
  check('addressId')
    .isMongoId()
    .withMessage('Invalid address ID'),
  
  check('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  check('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  check('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];