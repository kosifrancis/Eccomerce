const express = require('express');

const {
    checkout,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus
} = require('../controllers/orderController');

const authenticateToken = require('../middleware/authMiddleware');
const {requireSellerRole} = require('../middleware/roleMiddleware');

const { initializePayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/checkout', authenticateToken, checkout);
router.post('/initialize-payment', authenticateToken, initializePayment);

router.get('/my-orders', authenticateToken, getMyOrders);

router.get(
    '/seller-orders',
    authenticateToken,
    requireSellerRole,
    getSellerOrders
);

router.patch(
    '/:orderId/status',
    authenticateToken,
    requireSellerRole,
    updateOrderStatus
);

router.put(
    '/:orderId/status',
    authenticateToken,
    requireSellerRole,
    updateOrderStatus
);

module.exports = router;