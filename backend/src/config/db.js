import mongoose from 'mongoose';
import { seedDemoData } from '../services/seedService.js';

let mongoMemoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();

  // If MONGODB_URI is provided and not the placeholder
  if (uri && !uri.includes('<username>')) {
    try {
      console.log(`[Database] Connecting to MongoDB`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[Database] Successfully connected to MongoDB Atlas / persistent database.`);
      await seedDemoData();
      return;
    } catch (err) {
      console.error(`[Database] MongoDB connection failed: ${err.message}`);
      console.error(`[Database] Tip: Ensure your IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.`);
      throw err;
    }
  }

  // Graceful fallback to mongodb-memory-server only if MONGODB_URI is completely empty
  console.log(`[Database] No remote MONGODB_URI found in .env.`);
  console.log(`[Database] Launching local embedded in-memory MongoDB for offline/local development...`);

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'nourish_wellness',
      },
    });
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to in-memory MongoDB: ${memoryUri}`);
    await seedDemoData();
  } catch (err) {
    console.error(`[Database] Failed to initialize in-memory MongoDB fallback:`, err.message);
    throw err;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('[Database] Disconnect error:', err);
  }
}
