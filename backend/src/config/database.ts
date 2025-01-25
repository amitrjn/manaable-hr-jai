import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    let uri: string;
    let mongod: MongoMemoryServer | null = null;

    // Always use in-memory database for demonstration
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log('Connected to in-memory MongoDB database');
    
    await mongoose.connect(uri);
    console.log('Database connection established');
    
    // Create test manager account
    const { User } = require('../models/User');
    const existingManager = await User.findOne({ email: 'manager@manaable.com' });
    if (!existingManager) {
      const manager = new User({
        email: 'manager@manaable.com',
        password: 'manager123',
        firstName: 'Test',
        lastName: 'Manager',
        department: 'Management',
        role: 'manager'
      });
      await manager.save();
      console.log('Test manager account created');
    }
    
    // Clean up the database when the Node process ends
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      if (mongod) {
        await mongod.stop();
      }
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      if (mongod) {
        await mongod.stop();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}
