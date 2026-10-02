const Product = require('../models/product');
const User = require('../models/user');

const createProduct = async (req, res) => {
    const { name, description, price, imageUrl, image } = req.body;

    if (!name || !description || !price) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    try {
        const userId = req.user.userId || req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const finalImageUrl = imageUrl || image || '';

        const product = new Product({
            name,
            description,
            price: Number(price),
            imageUrl: finalImageUrl,
            image: finalImageUrl,
            seller: user._id
        });

        await product.save();

        res.status(201).json(product);

    } catch (error) {
        console.error('CREATE PRODUCT ERROR:', error);

        res.status(500).json({
            message: 'Error creating product',
            error: error.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'username email').sort({ dateAdded: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('GET PRODUCTS ERROR:', error);
        res.status(500).json({
            message: 'Error getting products',
            error: error.message
        });
    }
};

const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'username email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('GET PRODUCT ERROR:', error);
        res.status(500).json({
            message: 'Error getting product',
            error: error.message
        });
    }
};

const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.userId || req.user.id;
        const products = await Product.find({ seller: sellerId }).sort({ dateAdded: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('GET SELLER PRODUCTS ERROR:', error);
        res.status(500).json({
            message: 'Error getting seller products',
            error: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, imageUrl, image } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const currentUserId = req.user.user?.id || req.user.userId || req.user.id;
        if (String(product.seller) !== String(currentUserId)) {
            return res.status(403).json({
                message: 'Access denied. You can only update your own products.'
            });
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (imageUrl !== undefined || image !== undefined) {
            const finalImg = imageUrl || image || '';
            product.imageUrl = finalImg;
            product.image = finalImg;
        }

        await product.save();

        res.status(200).json(product);
    } catch (error) {
        console.error('UPDATE PRODUCT ERROR:', error);
        res.status(500).json({
            message: 'Error updating product',
            error: error.message
        });
    }
};

module.exports = { createProduct, getProducts, getProduct, getSellerProducts, updateProduct };