// server/tests/product.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

describe('Product API', () => {
  let token;
  let shopOwnerToken;
  let productId;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    
    // Create test users
    const customer = await User.create({
      email: 'customer@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Customer',
      userType: 'customer'
    });
    
    const shopOwner = await User.create({
      email: 'shop@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Shop',
      userType: 'shop_owner'
    });
    
    // Generate tokens
    token = generateToken(customer._id);
    shopOwnerToken = generateToken(shopOwner._id);
    
    // Create test product
    const product = await Product.create({
      name: 'Test Product',
      description: 'This is a test product',
      price: 19.99,
      category: mongoose.Types.ObjectId(),
      inventory: {
        quantity: 10,
        sku: 'TEST-123'
      },
      shopId: shopOwner._id
    });
    
    productId = product._id;
  });
  
  afterAll(async () => {
    // Clean up test database
    await User.deleteMany({});
    await Product.deleteMany({});
    
    // Disconnect from test database
    await mongoose.connection.close();
  });
  
  describe('GET /api/products', () => {
    test('should get all products', async () => {
      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toBeInstanceOf(Array);
      expect(res.body.products.length).toBeGreaterThan(0);
    });
    
    test('should filter products by category', async () => {
      const product = await Product.findById(productId);
      
      const res = await request(app)
        .get(`/api/products?categories=${product.category}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toBeInstanceOf(Array);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.products[0].category.toString()).toBe(product.category.toString());
    });
  });
  
  describe('GET /api/products/:id', () => {
    test('should get product by ID', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body._id.toString()).toBe(productId.toString());
      expect(res.body.name).toBe('Test Product');
    });
    
    test('should return 404 if product not found', async () => {
      const nonExistentId = mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/products/${nonExistentId}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });
  
  describe('POST /api/products', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'New Product',
          description: 'New product description',
          price: 29.99,
          category: mongoose.Types.ObjectId(),
          inventory: {
            quantity: 5
          }
        });
      
      expect(res.statusCode).toBe(401);
    });
    
    test('should require shop owner role', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Product',
          description: 'New product description',
          price: 29.99,
          category: mongoose.Types.ObjectId(),
          inventory: {
            quantity: 5
          }
        });
      
      expect(res.statusCode).toBe(403);
    });
    
    test('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New product description',
        price: 29.99,
        category: mongoose.Types.ObjectId(),
        inventory: {
          quantity: 5
        }
      };
      
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${shopOwnerToken}`)
        .send(newProduct);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(newProduct.name);
      expect(res.body.price).toBe(newProduct.price);
    });
  });
  
  describe('PUT /api/products/:id', () => {
    test('should update a product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 24.99
      };
      
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${shopOwnerToken}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.price).toBe(updateData.price);
    });
  });
  
  describe('DELETE /api/products/:id', () => {
    test('should delete a product', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${shopOwnerToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Product deleted successfully');
      
      // Verify product is deleted
      const checkProduct = await Product.findById(productId);
      expect(checkProduct).toBeNull();
    });
  });
});