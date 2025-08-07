import 'dotenv/config';
import mongoose from 'mongoose';
import { initScheduledMessagesWorker } from './controllers/scheduller.controller';
import app from './app';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Try to connect to MongoDB first
        const MONGO_URI = process.env.MONGODB_URI!;
        await mongoose.connect(MONGO_URI);
        
        // Initialize scheduled messages worker after DB connection
        await initScheduledMessagesWorker();
    } catch (err) {
        console.warn('MongoDB connection failed, continuing without database:', err);
        // Don't exit, continue without database for testing
    }
    
    // Start server regardless of MongoDB connection
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
