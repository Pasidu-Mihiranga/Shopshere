// server/routes/healthRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');

// Add this to healthRoutes.js
router.get('/', (req, res) => {
  res.json({
    message: 'SHOPSPHERE API - Health & Status',
    availableEndpoints: [
      'GET /api/health - Basic health check',
      'GET /api/health/detailed - Detailed health check',
      'GET /api/ready - Readiness probe',
      'GET /api/live - Liveness probe',
      'GET /api/version - API version info'
    ],
    timestamp: new Date().toISOString()
  });
});

// Basic health check endpoint
router.get('/', (req, res) => {
  try {
    console.log('Health check endpoint hit');
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health check with database connectivity
router.get('/detailed', async (req, res) => {
  try {
    console.log('Detailed health check endpoint hit');
    
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        server: 'OK',
        database: 'CHECKING'
      }
    };

    // Check database connection
    try {
      console.log('Mongoose connection state:', mongoose.connection.readyState);
      
      if (mongoose.connection.readyState === 1) {
        // Test actual database operation
        await mongoose.connection.db.admin().ping();
        healthCheck.services.database = 'OK';
      } else {
        healthCheck.services.database = 'DISCONNECTED';
        healthCheck.status = 'DEGRADED';
      }
    } catch (dbError) {
      console.error('Database health check error:', dbError);
      healthCheck.services.database = 'ERROR';
      healthCheck.status = 'DEGRADED';
    }

    // Set appropriate status code
    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Detailed health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness probe (for deployment/containerization)
router.get('/ready', async (req, res) => {
  try {
    console.log('Readiness check endpoint hit');
    
    // Check if all required services are ready
    const isReady = mongoose.connection.readyState === 1;
    
    if (isReady) {
      res.status(200).json({
        status: 'READY',
        message: 'Application is ready to accept traffic',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'NOT_READY',
        message: 'Application is not ready to accept traffic',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Readiness check error:', error);
    res.status(503).json({
      status: 'NOT_READY',
      message: 'Readiness check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Liveness probe (for deployment/containerization)
router.get('/live', (req, res) => {
  try {
    console.log('Liveness check endpoint hit');
    res.status(200).json({
      status: 'ALIVE',
      message: 'Application is alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Liveness check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Liveness check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// API version information
router.get('/version', (req, res) => {
  try {
    console.log('Version check endpoint hit');
    
    let packageInfo = {
      name: 'SHOPSPHERE API',
      version: '1.0.0',
      description: 'E-commerce platform API'
    };

    // Try to read package.json safely
    try {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = require(packageJsonPath);
      
      packageInfo = {
        name: packageJson.name || packageInfo.name,
        version: packageJson.version || packageInfo.version,
        description: packageJson.description || packageInfo.description
      };
    } catch (packageError) {
      console.warn('Could not read package.json:', packageError.message);
    }

    res.status(200).json({
      ...packageInfo,
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Version check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Version check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;