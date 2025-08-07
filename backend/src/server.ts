import 'dotenv/config';
import mongoose from 'mongoose';
import { initScheduledMessagesWorker } from './controllers/scheduller.controller';
import app from './app';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal: string) {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    try {
        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
        }
        
        console.log('Graceful shutdown completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
}

const startServer = async () => {
    try {
        console.log(`Starting server in ${NODE_ENV} mode...`);
        
        // MongoDB connection with retry logic
        const MONGO_URI = process.env.MONGODB_URI;
        if (MONGO_URI) {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(MONGO_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log('Connected to MongoDB successfully');
            
            // Initialize scheduled messages worker after DB connection
            console.log('Initializing scheduled messages worker...');
            await initScheduledMessagesWorker();
            console.log('Scheduled messages worker initialized');
        } else {
            console.warn('MONGODB_URI not provided. Running without database connection.');
        }
        
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        if (NODE_ENV === 'production') {
            console.error('Exiting due to database connection failure in production');
            process.exit(1);
        } else {
            console.warn('Continuing without database in development mode');
        }
    }
    
    // Start server
    const server = app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${NODE_ENV}`);
        console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
        
        if (NODE_ENV === 'development') {
            console.log(`🔗 Local API: http://localhost:${PORT}`);
        }
    });

    // Handle server errors
    server.on('error', (error: any) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        switch (error.code) {
            case 'EACCES':
                console.error(`Port ${PORT} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    return server;
};

// Start the server
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
