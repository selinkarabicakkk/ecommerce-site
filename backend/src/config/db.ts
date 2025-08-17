import mongoose from 'mongoose';
import config from './config';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    const dbName = conn.connection.name || (conn.connection.db as any)?.databaseName;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    if (dbName) {
      console.log(`MongoDB Database: ${dbName}`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

export default connectDB; 