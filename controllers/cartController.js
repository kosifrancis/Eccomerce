const Cart = require('../models/cart');

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).json({
            message: 'Product ID is required'
        });
    }

    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            cart.items.push({
                product: productId,
                quantity: quantity || 1
            });
        }

        await cart.save();

        res.status(200).json({
            message: 'Product added to cart',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to add product to cart',
            error: error.message
        });
    }
};

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        if (!cart) {
            return res.status(200).json({
                message: 'Cart is empty',
                items: [],
                totalItems: 0,
                totalPrice: 0
            });
        }

        const { totalItems, totalPrice } = cart.getTotals();

        res.status(200).json({
            items: cart.items,
            totalItems,
            totalPrice
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to get cart',
            error: error.message
        });
    }
};

const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
        return res.status(400).json({
            message: 'Product ID and quantity are required'
        });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: 'Product not found in cart'
            });
        }

        item.quantity = quantity;

        await cart.save();

        res.status(200).json({
            message: 'Cart updated successfully',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update cart',
            error: error.message
        });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({
            message: 'Product ID is required'
        });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                message: 'Product not found in cart'
            });
        }

        cart.items.splice(itemIndex, 1);

        await cart.save();

        res.status(200).json({
            message: 'Product removed from cart',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to remove product from cart',
            error: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        cart.items = [];

        await cart.save();

        res.status(200).json({
            message: 'Cart cleared successfully',
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};

module.exports = {
    addToCart,getCart,updateCartItem,removeFromCart,clearCart
};
