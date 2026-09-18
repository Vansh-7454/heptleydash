require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket');
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

    server.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 heptley CRM Backend running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Real-Time Socket.IO: Activated`);
      console.log(`🔗 Allowed Client: ${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}`);
      console.log(`==================================================\n`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        const { disconnectDB } = require('./config/db');
        await disconnectDB();
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
