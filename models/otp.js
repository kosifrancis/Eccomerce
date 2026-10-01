const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    otp : {
        type: String,
        required: true
    },

    expiresAt : {
        type: Date,
        required: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.otp ||
    mongoose.model('otp', otpSchema);