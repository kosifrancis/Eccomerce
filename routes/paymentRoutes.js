const express = require('express');
const {
    initializePayment,
    handleCallback,
    handleWebhook,
    verifyPaymentStatus,
    renderSuccessPage,
    renderFailedPage,
    simulatePaymentSuccess
} = require('../controllers/paymentController');

const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Paystack checkout / payment for products or cart
router.post('/initialize', authenticateToken, initializePayment);

// Callback URL for Paystack redirect after customer payment
router.get('/callback', handleCallback);

// Webhook endpoint for Paystack events (e.g. charge.success)
router.post('/webhook', handleWebhook);

// Programmatic verification by reference
router.get('/verify/:reference', verifyPaymentStatus);

// Sandbox / Simulation endpoint
router.post('/simulate-success', simulatePaymentSuccess);

// Demo success and failed pages
router.get('/success', renderSuccessPage);
router.get('/failed', renderFailedPage);

module.exports = router;
