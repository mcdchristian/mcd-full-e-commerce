const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const next = require('next');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.APP_URL
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());

// Stripe webhook needs raw body
app.use((req, res, next) => {
  if (req.originalUrl === '/api/orders/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Next.js setup
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const nextApp = next({ dev, dir: path.join(__dirname, '../frontend'), hostname, port });
const handle = nextApp.getRequestHandler();

// Function to prepare Next.js and setup the catch-all route
app.prepareNext = async () => {
  await nextApp.prepare();
  console.log('Next.js app prepared');
  
  // Use a middleware as catch-all to handle all other requests with Next.js
  app.use((req, res) => {
    return handle(req, res);
  });
};

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
