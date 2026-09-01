const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const next = require('next');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { sequelize } = require('./config/db');

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
// A liveness probe that never touches the database reports "ok" while every
// request is failing, so the connection is verified before answering.
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'up'
  };

  try {
    await sequelize.authenticate();
  } catch (error) {
    logger.error('Health check database probe failed', { requestId: req.id, error: error.message });
    return res.status(503).json({ ...health, status: 'degraded', database: 'down' });
  }

  res.json(health);
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
