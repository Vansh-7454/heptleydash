const mongoose = require('mongoose');

let cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI || 'mongodb+srv://goelvansh_149:vansh149@cluster0.voekzjo.mongodb.net/?appName=Cluster0';

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        console.log(`[Database] Connecting to MongoDB Atlas...`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`[Database] Connected to MongoDB Atlas: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (err) {
        console.error(`[Database] MongoDB connection error: ${err.message}`);
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

const disconnectDB = async () => {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
};

module.exports = { connectDB, disconnectDB };
