const axios = require('axios');

/**
 * Paystack Payment Integration
 * Docs: https://paystack.com/docs/api/
 */

const PAYSTACK_BASE = 'https://api.paystack.co';

/**
 * Initialize a Paystack transaction — returns an authorization URL.
 * @param {number} amount - Amount in the lowest currency unit (kobo for NGN, pesewas for GHS, cents for USD)
 * @param {string} email - Customer email
 * @param {string} reference - Unique transaction reference
 * @param {string} callbackUrl - URL Paystack redirects to after payment
 * @param {string} currency - Currency code (default NGN)
 */
const initializeTransaction = async (amount, email, reference, callbackUrl, currency = 'NGN') => {
    try {
        const payload = {
            email,
            amount: Math.round(amount * 100), // Paystack expects smallest unit (kobo/cents)
            reference,
            currency: currency.toUpperCase()
        };

        if (callbackUrl) {
            payload.callback_url = callbackUrl;
        }

        const response = await axios.post(`${PAYSTACK_BASE}/transaction/initialize`, payload, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return { success: true, data: response.data.data };
    } catch (error) {
        console.error('Paystack Init Error:', error.response ? error.response.data : error.message);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

/**
 * Verify a Paystack transaction after redirect.
 * @param {string} reference - Transaction reference
 */
const verifyTransaction = async (reference) => {
    try {
        const response = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const data = response.data.data;
        if (data.status === 'success') {
            return { success: true, status: 'completed', data };
        }
        return { success: false, status: data.status, data };
    } catch (error) {
        console.error('Paystack Verify Error:', error.response ? error.response.data : error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { initializeTransaction, verifyTransaction };
