const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let memoryServer = null;

const seedInitialData = async () => {
    try {
        const User = require('../models/user');
        const Product = require('../models/product');
        const Order = require('../models/order');
        const Feedback = require('../models/feedback');

        const userCount = await User.countDocuments();
        if (userCount > 0) return; // Already seeded

        console.log('Seeding initial demo data...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Demo Seller
        const seller = await User.create({
            username: 'TechStore',
            email: 'seller@market.com',
            password: hashedPassword,
            role: 'seller',
            phonenumber: '+2348012345678'
        });

        // Create Demo Buyer
        const buyer = await User.create({
            username: 'JaneBuyer',
            email: 'buyer@market.com',
            password: hashedPassword,
            role: 'buyer',
            phonenumber: '+2348087654321'
        });

        // Create Sample Products
        const productsData = [
            {
                name: 'Apple MacBook Pro 14" M3',
                description: 'Supercharged by Apple M3 Pro chip. 18GB Unified Memory, 512GB SSD, Liquid Retina XDR display with brilliant color accuracy.',
                price: 1850000,
                imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                seller: seller._id
            },
            {
                name: 'Sony WH-1000XM5 Wireless Headphones',
                description: 'Industry-leading noise cancellation with dual processors, 8 microphones, and up to 30 hours of continuous battery life.',
                price: 320000,
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                seller: seller._id
            },
            {
                name: 'Apple iPhone 15 Pro Max 256GB',
                description: 'Forged in titanium, featuring the groundbreaking A17 Pro chip, customizable Action button, and 48MP main camera.',
                price: 1450000,
                imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
                seller: seller._id
            },
            {
                name: 'Minimalist Mechanical Keyboard',
                description: 'Hot-swappable tactile switches, per-key RGB backlighting, custom aluminum chassis, and seamless Bluetooth/USB-C connectivity.',
                price: 85000,
                imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
                image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
                seller: seller._id
            },
            {
                name: 'Logitech MX Master 3S Wireless Mouse',
                description: 'Quiet clicks, 8K DPI any-surface tracking, MagSpeed electromagnetic scrolling, and ergonomic design.',
                price: 95000,
                imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
                image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
                seller: seller._id
            },
            {
                name: 'Samsung 34" Curved Gaming Monitor',
                description: 'Ultra-wide WQHD (3440 x 1440) 165Hz refresh rate with 1ms response time and HDR10 support.',
                price: 520000,
                imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
                image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
                seller: seller._id
            }
        ];

        const createdProducts = await Product.insertMany(productsData);

        // Create a sample delivered order
        const sampleOrder = await Order.create({
            buyer: buyer._id,
            items: [
                {
                    product: createdProducts[1]._id,
                    quantity: 1,
                    price: createdProducts[1].price
                }
            ],
            totalPrice: createdProducts[1].price,
            status: 'delivered',
            paymentStatus: 'paid',
            paymentReference: 'PAY_SAMPLE_DEMO123',
            paidAt: new Date(Date.now() - 86400000)
        });

        // Create sample feedback
        await Feedback.create({
            buyer: buyer._id,
            product: createdProducts[1]._id,
            rating: 5,
            message: 'Exceptional sound quality and the noise cancellation is unreal! Fast delivery too.'
        });

        console.log('Sample demo data seeded successfully!');
    } catch (seedErr) {
        console.warn('Seeding warning:', seedErr.message);
    }
};

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom';
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 2000
        });
        console.log(`Connected to MongoDB at ${uri}`);
        await seedInitialData();
    } catch (error) {
        console.warn(`Could not connect to external MongoDB at ${uri} (${error.message}).`);
        console.log('Starting in-memory MongoDB server for development...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            memoryServer = await MongoMemoryServer.create();
            const memoryUri = memoryServer.getUri();
            await mongoose.connect(memoryUri);
            console.log(`In-memory MongoDB started and connected at ${memoryUri}`);
            await seedInitialData();
        } catch (memError) {
            console.error('Fatal: Failed to start in-memory MongoDB:', memError.message);
            process.exit(1);
        }
    }
};

module.exports = connectDB;