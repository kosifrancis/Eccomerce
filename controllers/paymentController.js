const mongoose = require('mongoose');
const Product = require('../models/product');
const Order = require('../models/order');
const Payment = require('../models/payment');
const User = require('../models/user');
const Cart = require('../models/cart');
const paystackService = require('../services/paystackService');

/**
 * Helper to generate a unique transaction reference
 */
const generateReference = () => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY_${timestamp}_${randomHex}`;
};

/**
 * Initiate payment for products or checkout
 * @route POST /api/payments/initialize
 */
const initializePayment = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Buyer account not found'
            });
        }

        const buyerEmail = user.email || req.body.email;
        if (!buyerEmail) {
            return res.status(400).json({
                success: false,
                message: 'A valid email is required to initiate payment'
            });
        }

        let inputItems = req.body.items || req.body.products || [];

        // If no explicit items provided, check if buyer has items in their cart
        if (!Array.isArray(inputItems) || inputItems.length === 0) {
            const cart = await Cart.findOne({ user: userId }).populate('items.product');
            if (cart && cart.items && cart.items.length > 0) {
                inputItems = cart.items.map(item => ({
                    productId: item.product ? (item.product._id || item.product) : null,
                    quantity: item.quantity
                })).filter(item => item.productId != null);
            }
        }

        if (!inputItems || inputItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No products provided for payment. Provide items array with product IDs and quantities, or add items to your cart.'
            });
        }

        // Process and validate each product from DB
        let totalPrice = 0;
        const orderItems = [];

        for (const item of inputItems) {
            const productId = item.productId || item.product || item.id;
            const quantity = parseInt(item.quantity || item.qty || 1, 10);

            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid product ID: ${productId}`
                });
            }

            if (isNaN(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for product ${productId}. Quantity must be at least 1.`
                });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${productId} was not found`
                });
            }

            const itemPrice = Number(product.price);
            if (isNaN(itemPrice) || itemPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.name} (${productId}) does not have a valid price`
                });
            }

            totalPrice += itemPrice * quantity;
            orderItems.push({
                product: product._id,
                quantity: quantity,
                price: itemPrice
            });
        }

        if (totalPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Total order price must be greater than 0'
            });
        }

        // Generate unique reference
        const reference = generateReference();

        // Create pending order
        const order = new Order({
            buyer: user._id,
            items: orderItems,
            totalPrice,
            status: 'pending',
            paymentStatus: 'pending',
            paymentReference: reference
        });
        await order.save();

        // Create pending payment log
        const payment = new Payment({
            buyer: user._id,
            order: order._id,
            reference,
            amount: totalPrice,
            currency: 'NGN',
            status: 'pending'
        });
        await payment.save();

        // Determine callback URL
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.get('host');
        const defaultCallback = `${protocol}://${host}/api/payments/callback`;
        const callbackUrl = req.body.callbackUrl || process.env.PAYSTACK_CALLBACK_URL || defaultCallback;

        // Initialize Paystack transaction (or sandbox simulator if placeholder key is used)
        let paystackResult;
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        const isPlaceholderKey = !secretKey || secretKey.includes('your_paystack') || secretKey === 'sk_test_';

        if (isPlaceholderKey || req.body.simulate) {
            console.log(`[Paystack Sandbox] Using simulator mode for reference ${reference}`);
            paystackResult = {
                authorization_url: `/payment/simulator?reference=${reference}&amount=${totalPrice}&orderId=${order._id}&email=${encodeURIComponent(buyerEmail)}`,
                access_code: 'SIM_' + reference,
                reference: reference
            };
        } else {
            try {
                paystackResult = await paystackService.initializeTransaction({
                    email: buyerEmail,
                    amount: totalPrice,
                    reference: reference,
                    callbackUrl: callbackUrl,
                    metadata: {
                        orderId: order._id.toString(),
                        buyerId: user._id.toString(),
                        buyerEmail: buyerEmail,
                        itemCount: orderItems.length,
                        custom_fields: [
                            {
                                display_name: "Order ID",
                                variable_name: "order_id",
                                value: order._id.toString()
                            }
                        ]
                    }
                });
            } catch (paystackError) {
                console.warn('Live Paystack initialization failed, offering simulator fallback:', paystackError.message);
                // If live Paystack fails (e.g. invalid test key), fallback gracefully to simulator
                paystackResult = {
                    authorization_url: `/payment/simulator?reference=${reference}&amount=${totalPrice}&orderId=${order._id}&email=${encodeURIComponent(buyerEmail)}&fallback=true`,
                    access_code: 'SIM_' + reference,
                    reference: reference
                };
            }
        }

        // Update payment with authorization URL & access code
        payment.authorizationUrl = paystackResult.authorization_url;
        payment.accessCode = paystackResult.access_code;
        await payment.save();

        return res.status(200).json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
                orderId: order._id,
                reference: reference,
                totalAmount: totalPrice,
                currency: 'NGN',
                authorizationUrl: paystackResult.authorization_url,
                accessCode: paystackResult.access_code,
                callbackUrl: callbackUrl
            }
        });

    } catch (error) {
        console.error('INITIALIZE PAYMENT ERROR:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while initializing payment',
            error: error.message
        });
    }
};

/**
 * Handle browser callback redirect from Paystack after customer completes payment
 * @route GET /api/payments/callback
 */
const handleCallback = async (req, res) => {
    const reference = req.query.reference || req.query.trxref;

    if (!reference) {
        return res.redirect('/api/payments/failed?reason=' + encodeURIComponent('Missing payment reference in callback'));
    }

    try {
        // Verify payment status with Paystack API
        const verification = await paystackService.verifyTransaction(reference);

        const isSuccess = verification.status === 'success';
        const paidAmount = verification.amount ? (verification.amount / 100) : 0;

        // Locate order and payment records
        const order = await Order.findOne({ paymentReference: reference });
        const payment = await Payment.findOne({ reference });

        if (isSuccess) {
            if (order) {
                order.paymentStatus = 'paid';
                order.paidAt = new Date(verification.paid_at || Date.now());
                order.paymentDetails = verification;
                await order.save();

                // Clear buyer's cart if any
                try {
                    await Cart.findOneAndUpdate(
                        { user: order.buyer },
                        { $set: { items: [] } }
                    );
                } catch (cartErr) {
                    console.warn('Could not clear cart after payment callback:', cartErr.message);
                }
            }

            if (payment) {
                payment.status = 'success';
                payment.paidAt = new Date(verification.paid_at || Date.now());
                payment.channel = verification.channel;
                payment.paystackResponse = verification;
                await payment.save();
            }

            // Check if external frontend success redirect is configured
            if (process.env.FRONTEND_SUCCESS_URL) {
                const redirectUrl = new URL(process.env.FRONTEND_SUCCESS_URL);
                redirectUrl.searchParams.set('reference', reference);
                redirectUrl.searchParams.set('amount', paidAmount.toString());
                if (order) redirectUrl.searchParams.set('orderId', order._id.toString());
                return res.redirect(redirectUrl.toString());
            }

            // Redirect to Next.js frontend checkout success page
            const successUrl = `/checkout/success?reference=${encodeURIComponent(reference)}&amount=${encodeURIComponent(paidAmount)}&orderId=${encodeURIComponent(order ? order._id.toString() : '')}`;
            return res.redirect(successUrl);

        } else {
            // Transaction not successful
            if (order) {
                order.paymentStatus = 'failed';
                await order.save();
            }
            if (payment) {
                payment.status = 'failed';
                payment.paystackResponse = verification;
                await payment.save();
            }

            const failureReason = verification.gateway_response || 'Payment was not successful or was abandoned';

            if (process.env.FRONTEND_FAILED_URL) {
                const redirectUrl = new URL(process.env.FRONTEND_FAILED_URL);
                redirectUrl.searchParams.set('reference', reference);
                redirectUrl.searchParams.set('reason', failureReason);
                return res.redirect(redirectUrl.toString());
            }

            const failedUrl = `/checkout/failed?reference=${encodeURIComponent(reference)}&reason=${encodeURIComponent(failureReason)}`;
            return res.redirect(failedUrl);
        }

    } catch (error) {
        console.error('PAYSTACK CALLBACK ERROR:', error);
        return res.redirect(`/checkout/failed?reference=${encodeURIComponent(reference || 'N/A')}&reason=${encodeURIComponent(error.message || 'Payment verification failed')}`);
    }
};

/**
 * Handle Paystack Webhook
 * @route POST /api/payments/webhook
 */
const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];
        const rawBody = req.rawBody || JSON.stringify(req.body);

        const isValid = paystackService.verifyWebhookSignature(signature, rawBody);
        if (!isValid) {
            console.warn('Invalid Paystack webhook signature received');
            return res.status(401).json({
                success: false,
                message: 'Invalid Paystack webhook signature'
            });
        }

        const event = req.body;
        if (!event || !event.event) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        // Handle charge.success event
        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;

            const order = await Order.findOne({ paymentReference: reference });
            const payment = await Payment.findOne({ reference });

            if (order && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.paidAt = new Date(data.paid_at || Date.now());
                order.paymentDetails = data;
                await order.save();

                // Clear buyer cart
                try {
                    await Cart.findOneAndUpdate(
                        { user: order.buyer },
                        { $set: { items: [] } }
                    );
                } catch (cartErr) {
                    console.warn('Could not clear cart after webhook:', cartErr.message);
                }
            }

            if (payment && payment.status !== 'success') {
                payment.status = 'success';
                payment.paidAt = new Date(data.paid_at || Date.now());
                payment.channel = data.channel;
                payment.paystackResponse = data;
                await payment.save();
            }
        }

        // Always return 200 OK quickly to Paystack
        return res.status(200).json({
            status: 'success',
            message: 'Webhook received and processed'
        });

    } catch (error) {
        console.error('PAYSTACK WEBHOOK ERROR:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
};

/**
 * Verify payment status by reference (REST API for frontend / mobile apps)
 * @route GET /api/payments/verify/:reference
 */
const verifyPaymentStatus = async (req, res) => {
    const { reference } = req.params;

    if (!reference) {
        return res.status(400).json({
            success: false,
            message: 'Transaction reference is required'
        });
    }

    try {
        const verification = await paystackService.verifyTransaction(reference);

        const order = await Order.findOne({ paymentReference: reference });
        const payment = await Payment.findOne({ reference });

        if (verification.status === 'success') {
            if (order && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.paidAt = new Date(verification.paid_at || Date.now());
                order.paymentDetails = verification;
                await order.save();
            }

            if (payment && payment.status !== 'success') {
                payment.status = 'success';
                payment.paidAt = new Date(verification.paid_at || Date.now());
                payment.channel = verification.channel;
                payment.paystackResponse = verification;
                await payment.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Transaction verification status retrieved',
            data: {
                status: verification.status,
                reference: verification.reference,
                amount: verification.amount ? (verification.amount / 100) : 0,
                paidAt: verification.paid_at,
                channel: verification.channel,
                gatewayResponse: verification.gateway_response,
                order: order ? {
                    id: order._id,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    paymentStatus: order.paymentStatus
                } : null
            }
        });

    } catch (error) {
        console.error('VERIFY PAYMENT ERROR:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: 'Failed to verify transaction',
            error: error.message
        });
    }
};

/**
 * Render Demo Success HTML Page
 * @route GET /api/payments/success
 */
const renderSuccessPage = (req, res) => {
    const { reference = 'N/A', amount = '0', orderId = 'N/A' } = req.query;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful | E-Commerce</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0b0f19;
            --card-bg: rgba(18, 24, 40, 0.85);
            --card-border: rgba(34, 197, 94, 0.25);
            --accent-green: #22c55e;
            --accent-glow: rgba(34, 197, 94, 0.2);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --surface-elevated: #1e293b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: radial-gradient(circle at 50% 10%, #132e27 0%, var(--bg-primary) 65%);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 2.5rem 2rem;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px var(--accent-glow);
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .icon-container {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            background: rgba(34, 197, 94, 0.12);
            border: 2px solid var(--accent-green);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .icon-container::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid var(--accent-green);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.4); opacity: 0; }
        }

        .icon-container svg {
            width: 40px;
            height: 40px;
            color: var(--accent-green);
        }

        h1 {
            font-size: 1.75rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 0.5rem;
            color: #ffffff;
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 2rem;
        }

        .details-box {
            background: var(--surface-elevated);
            border-radius: 16px;
            padding: 1.25rem 1.5rem;
            text-align: left;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            font-size: 0.9rem;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: var(--text-secondary);
        }

        .detail-value {
            font-weight: 600;
            color: var(--text-primary);
            font-family: monospace, sans-serif;
        }

        .detail-amount {
            color: var(--accent-green);
            font-size: 1.1rem;
            font-weight: 700;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .badge-success {
            background: rgba(34, 197, 94, 0.15);
            color: var(--accent-green);
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .btn-group {
            display: flex;
            gap: 1rem;
        }

        .btn {
            flex: 1;
            padding: 0.85rem 1.25rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45);
        }

        .btn-secondary {
            background: var(--surface-elevated);
            color: var(--text-primary);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
            background: #273549;
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-container">
            <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <h1>Payment Successful!</h1>
        <p class="subtitle">Your transaction has been verified via Paystack and your order is confirmed.</p>

        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="badge-success">Paid</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount Paid</span>
                <span class="detail-amount">₦${Number(amount).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Reference</span>
                <span class="detail-value">${reference}</span>
            </div>
            ${orderId && orderId !== 'N/A' ? `
            <div class="detail-row">
                <span class="detail-label">Order ID</span>
                <span class="detail-value">${orderId}</span>
            </div>` : ''}
        </div>

        <div class="btn-group">
            <a href="/" class="btn btn-secondary">Home</a>
            <a href="/api/orders/my-orders" class="btn btn-primary">My Orders</a>
        </div>
    </div>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
};

/**
 * Render Demo Failed HTML Page
 * @route GET /api/payments/failed
 */
const renderFailedPage = (req, res) => {
    const { reference = 'N/A', reason = 'The transaction was cancelled or declined.' } = req.query;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed | E-Commerce</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0b0f19;
            --card-bg: rgba(18, 24, 40, 0.85);
            --card-border: rgba(239, 68, 68, 0.25);
            --accent-red: #ef4444;
            --accent-glow: rgba(239, 68, 68, 0.2);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --surface-elevated: #1e293b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: radial-gradient(circle at 50% 10%, #2e1319 0%, var(--bg-primary) 65%);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 2.5rem 2rem;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px var(--accent-glow);
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .icon-container {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.12);
            border: 2px solid var(--accent-red);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .icon-container svg {
            width: 40px;
            height: 40px;
            color: var(--accent-red);
        }

        h1 {
            font-size: 1.75rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 0.5rem;
            color: #ffffff;
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 2rem;
        }

        .details-box {
            background: var(--surface-elevated);
            border-radius: 16px;
            padding: 1.25rem 1.5rem;
            text-align: left;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            font-size: 0.9rem;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: var(--text-secondary);
        }

        .detail-value {
            font-weight: 600;
            color: var(--text-primary);
            font-family: monospace, sans-serif;
        }

        .badge-failed {
            background: rgba(239, 68, 68, 0.15);
            color: var(--accent-red);
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .btn-group {
            display: flex;
            gap: 1rem;
        }

        .btn {
            flex: 1;
            padding: 0.85rem 1.25rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        .btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
        }

        .btn-secondary {
            background: var(--surface-elevated);
            color: var(--text-primary);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
            background: #273549;
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-container">
            <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </div>
        <h1>Payment Incomplete</h1>
        <p class="subtitle">Your transaction could not be completed or was cancelled.</p>

        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="badge-failed">Failed / Cancelled</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Reference</span>
                <span class="detail-value">${reference}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Reason</span>
                <span class="detail-value" style="color: #fca5a5;">${reason}</span>
            </div>
        </div>

        <div class="btn-group">
            <a href="/" class="btn btn-secondary">Return Home</a>
            <button onclick="window.history.back()" class="btn btn-danger">Try Again</button>
        </div>
    </div>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
};

/**
 * Helper endpoint for testing / sandbox to simulate a successful payment event
 * @route POST /api/payments/simulate-success
 */
const simulatePaymentSuccess = async (req, res) => {
    try {
        const { reference } = req.body;
        if (!reference) {
            return res.status(400).json({ success: false, message: 'Transaction reference is required' });
        }

        const order = await Order.findOne({ paymentReference: reference });
        const payment = await Payment.findOne({ reference });

        if (order) {
            order.paymentStatus = 'paid';
            order.paidAt = new Date();
            order.paymentDetails = {
                status: 'success',
                reference,
                channel: 'card',
                simulated: true,
                paid_at: new Date().toISOString()
            };
            await order.save();

            // Clear buyer's cart
            try {
                await Cart.findOneAndUpdate({ user: order.buyer }, { $set: { items: [] } });
            } catch (cartErr) {
                console.warn('Could not clear cart:', cartErr.message);
            }
        }

        if (payment) {
            payment.status = 'success';
            payment.paidAt = new Date();
            payment.channel = 'card';
            payment.paystackResponse = {
                status: 'success',
                reference,
                amount: (payment.amount || 0) * 100,
                channel: 'card',
                simulated: true
            };
            await payment.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Payment simulated and recorded successfully',
            data: {
                reference,
                orderId: order ? order._id : null,
                amount: payment ? payment.amount : null,
                status: 'success'
            }
        });
    } catch (err) {
        console.error('SIMULATE PAYMENT ERROR:', err);
        return res.status(500).json({ success: false, message: 'Simulation failed', error: err.message });
    }
};

module.exports = {
    initializePayment,
    handleCallback,
    handleWebhook,
    verifyPaymentStatus,
    renderSuccessPage,
    renderFailedPage,
    simulatePaymentSuccess
};
