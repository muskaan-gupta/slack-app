import 'dotenv/config';
import mongoose from 'mongoose';
import { initScheduledMessagesWorker } from './controllers/scheduller.controller';
import app from './app';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Try to connect to MongoDB with timeout
        const MONGO_URI = process.env.MONGODB_URI;
        if (MONGO_URI) {
            console.log('Attempting to connect to MongoDB...');
            await mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000, // 5 second timeout
                connectTimeoutMS: 10000, // 10 second timeout
            });
            console.log('Connected to MongoDB successfully');
            
            // Initialize scheduled messages worker after DB connection
            await initScheduledMessagesWorker();
            console.log('Scheduled messages worker initialized');
        } else {
            console.warn('MONGODB_URI not provided, continuing without database');
        }
    } catch (err) {
        console.warn('MongoDB connection failed, continuing without database:', err);
        // Don't exit, continue without database for testing
    }
    
    // Start server regardless of MongoDB connection
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });
};

startServer();
