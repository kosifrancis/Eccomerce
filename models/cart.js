const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            }
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

cartSchema.methods.getTotals = function () {
    let totalItems = 0;
    let totalPrice = 0;

    this.items.forEach(item => {
        totalItems += item.quantity;

        if (item.product && item.product.price) {
            totalPrice += item.product.price * item.quantity;
        }
    });

    return {
        totalItems,
        totalPrice
    };
};

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);