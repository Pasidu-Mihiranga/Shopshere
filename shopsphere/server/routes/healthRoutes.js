// server/routes/healthRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Basic health check endpoint
router.get('/health', (req, res) => {
  try {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check with database connectivity
router.get('/health/detailed', async (req, res) => {
  try {
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
      if (mongoose.connection.readyState === 1) {
        healthCheck.services.database = 'OK';
      } else {
        healthCheck.services.database = 'DISCONNECTED';
        healthCheck.status = 'DEGRADED';
      }
    } catch (dbError) {
      healthCheck.services.database = 'ERROR';
      healthCheck.status = 'DEGRADED';
    }

    // Set appropriate status code
    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
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
    res.status(200).json({
      status: 'ALIVE',
      message: 'Application is alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
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
    const packageJson = require('../../package.json');
    
    res.status(200).json({
      name: packageJson.name || 'SHOPSPHERE API',
      version: packageJson.version || '1.0.0',
      description: packageJson.description || 'E-commerce platform API',
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(200).json({
      name: 'SHOPSPHERE API',
      version: '1.0.0',
      description: 'E-commerce platform API',
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;