const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const borrowRoutes = require('./routes/borrows');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const locationRoutes = require('./routes/locations');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const otpRoutes = require('./routes/otp');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/otp', otpRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Borrow, Not Buy - Sustainability Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      borrows: '/api/borrows',
      users: '/api/users',
      reviews: '/api/reviews',
      locations: '/api/locations',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/*`);
  console.log(`🌍 Frontend URL: ${config.FRONTEND_URL}`);
});

module.exports = app;
