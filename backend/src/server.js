require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket');
const { startDomainExpiryScheduler } = require('./services/domainExpiryService');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if initial admin exists, if not auto-seed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial neutral seed...');
      const seedDatabase = require('./scripts/seed');
      await seedDatabase();
    }

    const server = http.createServer(app);
    initSocket(server);

    // Activate automatic daily domain expiry scheduler
    startDomainExpiryScheduler();

    server.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 heptley CRM Backend running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Real-Time Socket.IO: Activated`);
      console.log(`🔗 Allowed Client: ${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}`);
      console.log(`==================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Server Error] Port ${PORT} is already in use by another process.`);
        console.error(`[Tip] Stop other running instances or free port ${PORT} before restarting.\n`);
      } else {
        console.error('[Server Error]', err);
      }
      process.exit(1);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      const forceExit = setTimeout(() => {
        process.exit(0);
      }, 1000);
      forceExit.unref();

      server.close(async () => {
        try {
          const { disconnectDB } = require('./config/db');
          await disconnectDB();
        } catch (_) {}
        console.log('[Server] Server closed. Database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();
