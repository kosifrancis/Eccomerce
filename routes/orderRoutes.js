const express = require('express');

const {
    checkout,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus
} = require('../controllers/orderController');

const authenticateToken = require('../middleware/authMiddleware');
const {requireSellerRole} = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/checkout', authenticateToken, checkout);

router.get('/my-orders', authenticateToken, getMyOrders);

router.get(
    '/seller-orders',
    authenticateToken,
    requireSellerRole,
    getSellerOrders
);

module.exports = router;