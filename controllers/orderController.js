const Cart = require('../models/cart');
const Order = require('../models/order');

const checkout = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: 'Cart is empty'
            });
        }

        let totalPrice = 0;

        const orderItems = cart.items.map(item => {
            // A populated product can be null if it was deleted.
            if (!item.product || typeof item.product.price !== 'number') {
                throw new Error('One or more products in the cart are unavailable');
            }

            const price = item.product.price;

            totalPrice += price * item.quantity;

            return {
                product: item.product._id,
                quantity: item.quantity,
                price: price
            };
        });

        const order = new Order({
            buyer: req.user.id,
            items: orderItems,
            totalPrice
        });

        await order.save();

        // Empty the cart after successful checkout
        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.error('CHECKOUT ERROR:', error);

        res.status(500).json({
            message: 'Checkout failed',
            error: error.message
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user.id })
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Orders retrieved successfully',
            orders
        });

    } catch (error) {
        console.error('GET ORDERS ERROR:', error);

        res.status(500).json({
            message: 'Failed to get orders',
            error: error.message
        });
    }
};
const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyer', 'username email')
            .populate('items.product');

        const sellerOrders = orders.filter(order =>
            order.items.some(
                item =>
                    item.product &&
                    item.product.seller &&
                    item.product.seller.toString() === req.user.id
            )
        );

        res.status(200).json({
            message: 'Seller orders retrieved successfully',
            orders: sellerOrders
        });

    } catch (error) {
        console.error('GET SELLER ORDERS ERROR:', error);

        res.status(500).json({
            message: 'Failed to get seller orders',
            error: error.message
        });
    }
};
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'shipped', 'delivered'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'Invalid order status'
        });
    }

    try {
        const order = await Order.findById(orderId)
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        const sellerOwnsProduct = order.items.some(
            item =>
                item.product &&
                item.product.seller &&
                item.product.seller.toString() === req.user.id
        );

        if (!sellerOwnsProduct) {
            return res.status(403).json({
                message: 'You are not authorized to update this order'
            });
        }

        order.status = status;

        await order.save();

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        console.error('UPDATE ORDER STATUS ERROR:', error);

        res.status(500).json({
            message: 'Failed to update order status',
            error: error.message
        });
    }
};
module.exports = {
    checkout,getMyOrders,getSellerOrders,updateOrderStatus
};

