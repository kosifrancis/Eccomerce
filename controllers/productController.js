const Product = require('../models/product');
const User = require('../models/User.js');


const createProduct = async (req, res) => {
    const { name, description, price, imageUrl, image } = req.body;

    if (!name || !description || !price) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    try {
        console.log('req.user:', req.user);

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const finalImageUrl = imageUrl || image || '';

        const product = new Product({
            name,
            description,
            price,
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


        const product = await Product.find()


        res.status(200).json(product);

    } catch (error) {
        console.error('GET PRODUCTS ERROR:', error);

        res.status(500).json({
            message: 'Error getting product',
            error: error.message
        });
    }
};

const getProduct = async (req, res) => {

    try {

          
        const product = await Product.findById(req.params.id)
        console.log(req.params.id)


        res.status(200).json(product);

    } catch (error) {
        console.error('GET PRODUCTS ERROR:', error);

        res.status(500).json({
            message: 'Error getting product',
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

        if (String(product.seller) !== String(req.user.user.id)) {
            return res.status(403).json({
                message: 'Access denied. You can only update your own products.'
            });
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
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

module.exports = { createProduct, getProducts, getProduct, updateProduct };