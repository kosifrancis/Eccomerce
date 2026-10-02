require('dotenv').config();

const express = require('express');
const next = require('next');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoles');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function startServer() {
    try {
        // Connect to MongoDB (with automatic in-memory fallback & seed data)
        await connectDB();

        // Prepare Next.js application
        console.log('> Preparing Next.js frontend application...');
        await nextApp.prepare();

        const app = express();

        // Capture raw body for Paystack webhook signature verification
        app.use(express.json({
            limit: '20mb',
            verify: (req, res, buf) => {
                req.rawBody = buf;
            }
        }));
        app.use(express.urlencoded({ extended: true, limit: '20mb' }));

        // Backend API Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/cart', cartRoutes);
        app.use('/api/orders', orderRoutes);
        app.use('/api/feedback', feedbackRoutes);
        app.use('/api/upload', uploadRoutes);
        app.use('/api/payments', paymentRoutes);

        // API Health status endpoint
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'ok',
                message: 'E-commerce API and Next.js server running unified',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });

        // Next.js handles all frontend routes, including pages, static assets, SSR
        app.use((req, res) => {
            return handle(req, res);
        });

        app.listen(port, () => {
            console.log(`\n========================================================`);
            console.log(`🚀 Unified Server running at http://localhost:${port}`);
            console.log(`🌐 Frontend (Next.js): http://localhost:${port}/`);
            console.log(`🔌 Backend API (Express): http://localhost:${port}/api`);
            console.log(`💳 Paystack Webhook: http://localhost:${port}/api/payments/webhook`);
            console.log(`🔄 Paystack Callback: http://localhost:${port}/api/payments/callback`);
            console.log(`========================================================\n`);
        });

    } catch (err) {
        console.error('Fatal Server Startup Error:', err);
        process.exit(1);
    }
}

startServer();