import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/dbConfig.js';
import { seedIdentities } from '../src/modules/identity/identity.service.js';

try {
  await connectDatabase();
  await seedIdentities();
  console.log('GrowthOS identity library is ready.');
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
