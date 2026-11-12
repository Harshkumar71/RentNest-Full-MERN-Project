
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import auth from './routes/authRoutes.js';
import properties from './routes/propertyRoutes.js';
import bookings from './routes/bookingRoutes.js';
import reviews from './routes/reviewRoutes.js';
import payments from './routes/paymentRoutes.js';
import admin from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS: ' + origin));
        }
    },
    credentials: true
}));

app.use(express.json());

// API home route
app.get('/', (_, res) => {
    res.json({
        name: 'RentNest API',
        status: 'running'
    });
});

// API routes
app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api/bookings', bookings);
app.use('/api/reviews', reviews);
app.use('/api/payments', payments);
app.use('/api/admin', admin);

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: err.message || 'Server error'
    });
});

// MongoDB connection and server startup
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');

        app.listen(process.env.PORT || 5000, () => {
            console.log('API running on port ' + (process.env.PORT || 5000));
            console.log('Allowed frontend origins:', allowedOrigins);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error);
    });
