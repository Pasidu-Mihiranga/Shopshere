const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import Routes
const authRoutes = require('./routes/authRoutes');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));