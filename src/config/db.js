import mongoose from 'mongoose';
import { mongoUri } from './env.js';

async function connectDB() {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

export default connectDB;
