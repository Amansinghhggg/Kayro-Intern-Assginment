import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { connectDB } from '../config/db.js';
import { resetAndSeedDemoData } from '../services/seedService.js';
import mongoose from 'mongoose';

async function main() {
  console.log('\n--- Nourish Database Reset & Re-Seed ---');
  try {
    await connectDB();
    await resetAndSeedDemoData();
    console.log('--- All demo records restored successfully! ---\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err.message);
    process.exit(1);
  }
}

main();
