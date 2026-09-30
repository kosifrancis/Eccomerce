const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Feedback ||
    mongoose.model('Feedback', feedbackSchema);