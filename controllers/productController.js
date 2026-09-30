const Product = require('../models/product');
const User = require('../models/User.js');


const createProduct = async (req, res) => {
    const { name, description, price } = req.body;

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

        const product = new Product({
            name,
            description,
            price,
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
module.exports = { createProduct, getProducts, getProduct };