const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const next = require('next');
const requestId = require('./middleware/requestId');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(requestId);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-origin' }
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
app.set('trust proxy', 1);

// Stripe webhook needs raw body
app.use((req, res, next) => {
  if (req.originalUrl === '/api/orders/webhook') {
    next();
  } else {
    express.json({ limit: '10kb' })(req, res, next);
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

// Handle unknown API routes (404).
// Mounted with app.use() rather than a wildcard path: Express 5 relies on
// path-to-regexp v8, which rejects the unnamed '*' pattern at startup.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.originalUrl} on this server`
  });
});

// Next.js setup
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const nextApp = next({ dev, dir: path.join(__dirname, '../frontend'), hostname, port });
const handle = nextApp.getRequestHandler();

// Error Handling Middleware
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    requestId: req.id,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Function to prepare Next.js and setup the catch-all route
app.prepareNext = async () => {
  await nextApp.prepare();
  logger.info('Next.js app prepared');

  // Use a middleware as catch-all to handle all other requests with Next.js
  app.use((req, res) => {
    return handle(req, res);
  });

  // Registered last: Express only routes an error to handlers declared after
  // the middleware that threw it.
  app.use(errorHandler);
};

module.exports = app;
