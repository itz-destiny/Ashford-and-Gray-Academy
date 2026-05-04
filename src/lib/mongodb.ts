import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ashford_gray';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Connecting to MongoDB...');
    const connectWithRetry = async (retries = 3): Promise<typeof mongoose> => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI, opts);
        console.log('MongoDB connected successfully');
        return mongooseInstance;
      } catch (err) {
        if (retries > 0) {
          console.warn(`MongoDB connection failed. Retrying... (${retries} left)`);
          await new Promise(res => setTimeout(res, 2000));
          return connectWithRetry(retries - 1);
        }
        throw err;
      }
    };
    cached.promise = connectWithRetry();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('CRITICAL: MongoDB connection failed after retries:', e);
    cached.promise = null; // Reset promise to allow retrying on next request
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
