const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'abandoned'],
        default: 'pending'
    },
    authorizationUrl: {
        type: String
    },
    accessCode: {
        type: String
    },
    channel: {
        type: String
    },
    paidAt: {
        type: Date
    },
    paystackResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
