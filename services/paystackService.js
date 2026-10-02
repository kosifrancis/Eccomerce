const crypto = require('crypto');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

class PaystackService {
    getSecretKey() {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
        }
        return secretKey;
    }

    /**
     * Initialize a Paystack transaction
     * @param {Object} params
     * @param {string} params.email - Customer email
     * @param {number} params.amount - Amount in Naira (will be converted to kobo)
     * @param {string} params.reference - Unique transaction reference
     * @param {string} [params.callbackUrl] - Callback URL for redirect
     * @param {Object} [params.metadata] - Extra metadata to attach
     * @returns {Promise<Object>}
     */
    async initializeTransaction({ email, amount, reference, callbackUrl, metadata = {} }) {
        const secretKey = this.getSecretKey();

        // Paystack expects amount in Kobo (1 NGN = 100 Kobo)
        const amountInKobo = Math.round(Number(amount) * 100);

        const payload = {
            email,
            amount: amountInKobo,
            reference,
            callback_url: callbackUrl,
            metadata
        };

        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            const errorMessage = data.message || 'Failed to initialize Paystack payment';
            const error = new Error(errorMessage);
            error.statusCode = response.status;
            error.paystackData = data;
            throw error;
        }

        return data.data; // { authorization_url, access_code, reference }
    }

    /**
     * Verify a transaction with Paystack by reference
     * @param {string} reference
     * @returns {Promise<Object>}
     */
    async verifyTransaction(reference) {
        const secretKey = this.getSecretKey();

        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            const errorMessage = data.message || 'Failed to verify Paystack payment';
            const error = new Error(errorMessage);
            error.statusCode = response.status;
            error.paystackData = data;
            throw error;
        }

        return data.data; // { id, status, reference, amount, customer, metadata, paid_at, ... }
    }

    /**
     * Verify Paystack webhook signature using HMAC SHA512
     * @param {string} signature - Value from x-paystack-signature header
     * @param {Buffer|string} rawBody - Raw body buffer or string
     * @returns {boolean}
     */
    verifyWebhookSignature(signature, rawBody) {
        if (!signature || !rawBody) {
            return false;
        }

        try {
            const secretKey = this.getSecretKey();
            const hash = crypto
                .createHmac('sha512', secretKey)
                .update(rawBody)
                .digest('hex');

            return hash === signature;
        } catch (error) {
            console.error('Paystack webhook signature verification error:', error);
            return false;
        }
    }
}

module.exports = new PaystackService();
