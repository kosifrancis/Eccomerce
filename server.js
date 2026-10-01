require('dotenv').config();

console.log("Mongo URI loaded:", !!process.env.MONGODB_URI);

const connectDB = require('./config/db');
const express = require('express');
const authRoutes = require('./routes/authRoles');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'E-commerce API is running'
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 