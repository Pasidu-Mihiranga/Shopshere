require('dotenv').config();

console.log(' Starting server.js...');
console.log(' Current directory:', __dirname);
console.log(' Looking for app.js at:', require.resolve('./app'));

// Import the Express app from app.js
const app = require('./app');

console.log(' App imported successfully');

const PORT = process.env.PORT || 5000;

console.log(` Attempting to start server on port ${PORT}...`);

// Start the server
const server = app.listen(PORT, () => {
  console.log('\n SHOPSPHERE SERVER STARTED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════');
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\n Test these URLs:');
  console.log(`    Root: http://localhost:${PORT}/`);
  console.log(`    API: http://localhost:${PORT}/api`);
  console.log(`    Health: http://localhost:${PORT}/api/health`);
  console.log(`    Test: http://localhost:${PORT}/api/test`);
  console.log(`    Products: http://localhost:${PORT}/api/products`);
  console.log('\n Server ready to accept requests!\n');
});

// Basic error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(` Port ${PORT} is already in use`);
    console.log(' Try a different port or kill the process using that port');
    process.exit(1);
  } else {
    console.error(' Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n ${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log(' HTTP server closed');
    console.log(' Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error(' Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
  console.log(' Shutting down due to uncaught exception');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(' Unhandled Rejection at:', promise, 'reason:', err);
  console.log(' Shutting down due to unhandled promise rejection');
  server.close(() => {
    process.exit(1);
  });
});

console.log(' Server.js setup complete');

module.exports = server;