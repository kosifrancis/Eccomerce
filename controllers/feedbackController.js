const Feedback = require('../models/feedback');

const createFeedback = async (req, res) => {
    const { product, message, rating } = req.body;

    if (!product || !message || !rating) {
        return res.status(400).json({
            message: 'Product, message and rating are required'
        });
    }

    try {
        const feedback = new Feedback({
            buyer: req.user.id,
            product,
            message,
            rating
        });

        await feedback.save();

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback
        });

    } catch (error) {
        console.error('CREATE FEEDBACK ERROR:', error);

        res.status(500).json({
            message: 'Failed to submit feedback',
            error: error.message
        });
    }
};
const getSellerFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate('buyer', 'username email')
            .populate({
                path: 'product',
                populate: {
                    path: 'seller',
                    select: 'username email'
                }
            });

        const sellerFeedback = feedback.filter(item =>
            item.product &&
            item.product.seller &&
            item.product.seller._id.toString() === req.user.id
        );

        res.status(200).json({
            message: 'Seller feedback retrieved successfully',
            feedback: sellerFeedback
        });

    } catch (error) {
        console.error('GET SELLER FEEDBACK ERROR:', error);

        res.status(500).json({
            message: 'Failed to get seller feedback',
            error: error.message
        });
    }
};

module.exports = {
    createFeedback, getSellerFeedback
};