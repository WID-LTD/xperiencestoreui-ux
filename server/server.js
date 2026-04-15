const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

// Load env vars
dotenv.config();


const app = express();

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        const frontendUrls = (process.env.FRONTEND_URL || '').split(',').map(url => url.trim());
        const allowed = [
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            'https://xperiencestore.store',
            'https://www.xperiencestore.store',
            ...frontendUrls,
            process.env.R2_PUBLIC_URL
        ].filter(Boolean);

        // Allow requests with no origin (like mobile apps, curl, Render health checks)
        if (!origin || allowed.some(o => origin.startsWith(o))) {
            return callback(null, true);
        }
        console.warn(`[CORS] Brige Blocked: ${origin}. Allowed: ${allowed.join(', ')}`);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Basic Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[SERVER] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Frontend Logging Bridge
app.post('/api/logs', (req, res) => {
    const { level, message, data, timestamp } = req.body;
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
    const reset = '\x1b[0m';

    console.log(`${color}[FRONTEND ${level.toUpperCase()}]${reset} [${new Date(timestamp).toLocaleTimeString()}] ${message}`);
    if (data) console.log(`  Data:`, JSON.stringify(data, null, 2));

    res.status(204).end();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const giftCardRoutes = require('./routes/giftCardRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const ordersRoutes = require('./routes/ordersRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/supplier', require('./routes/supplierRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/warehouse', require('./routes/warehouseRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/rfqs', require('./routes/rfqRoutes'));
app.use('/api/store', require('./routes/storeRoutes'));
app.use('/api/api-management', require('./routes/apiManagementRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));



// 404 for unknown API routes only
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API route ${req.path} not found` });
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// SPA routing: handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
