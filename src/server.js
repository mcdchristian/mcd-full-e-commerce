require('dotenv').config();
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');
const logger = require('./utils/logger');
const { findMissingEnvVars } = require('./utils/validateEnv');
const { isStripeKeyConfigured } = require('./utils/stripeConfig');
require('./models'); // Load associations

const validateEnv = () => {
  const missing = findMissingEnvVars(process.env);
  if (missing.length > 0) {
    logger.error('Missing required environment variables', {
      variables: missing,
      hint: 'Copy .env.example to .env and fill these in.'
    });
    process.exit(1);
  }
};

validateEnv();

// Present but inert is the common case: .env.example ships a placeholder key,
// and nothing surfaces it until a shopper reaches checkout and gets a 503.
const warnOnPlaceholderStripeKey = () => {
  if (!isStripeKeyConfigured(process.env.STRIPE_SECRET_KEY)) {
    logger.warn('Stripe secret key looks like a placeholder — checkout will answer 503', {
      hint: 'Set STRIPE_SECRET_KEY to a real key from https://dashboard.stripe.com/test/apikeys'
    });
  }
};

warnOnPlaceholderStripeKey();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Sync models
    await sequelize.sync({ force: false });
    logger.info('Database synced successfully');

    // Prepare Next.js
    await app.prepareNext();

    const server = app.listen(PORT, () => {
      logger.info('Server started', { mode: process.env.NODE_ENV, port: PORT });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info('Graceful shutdown initiated', { signal });
      server.close(async () => {
        await sequelize.close();
        logger.info('Database connection closed');
        process.exit(0);
      });
      // Force exit after 10s if graceful shutdown fails
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
