const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: Number,
                required: true
            }
        }
    ],

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'abandoned'],
        default: 'pending'
    },

    paymentReference: {
        type: String,
        sparse: true,
        index: true
    },

    paidAt: {
        type: Date
    },

    paymentDetails: {
        type: mongoose.Schema.Types.Mixed
    },

    createdAt: {
       type: Date,
       default: Date.now
    }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
