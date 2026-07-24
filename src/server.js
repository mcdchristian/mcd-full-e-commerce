require('dotenv').config();
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');
require('./models'); // Load associations

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Sync models
    await sequelize.sync({ force: false });
    console.log('Database synced');

    // Prepare Next.js
    await app.prepareNext();

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
      });
      // Force exit after 10s if graceful shutdown fails
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
