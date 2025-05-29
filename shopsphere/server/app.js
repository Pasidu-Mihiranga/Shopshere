// server/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const helmet = require('helmet');

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Set security HTTP headers
app.use(helmet());