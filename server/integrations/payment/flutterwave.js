const axios = require('axios');

/**
 * Flutterwave Payment Integration
 * Docs: https://developer.flutterwave.com/docs
 */

/**
 * Initialize a Flutterwave payment — returns a hosted payment link.
 * @param {number} amount - Amount in the specified currency
 * @param {object} customer - { email, phonenumber, name }
 * @param {string} currency - Currency code e.g. 'USD', 'NGN'
 * @param {string} txRef - Unique transaction reference
 * @param {string} redirectUrl - URL to redirect to after payment
 */
const initializePayment = async (amount, customer, currency = 'USD', txRef, redirectUrl) => {
    try {
        const siteUrl = process.env.SITE_URL || 'http://localhost:5000';
        const logoUrl = process.env.R2_PUBLIC_URL
            ? `${process.env.R2_PUBLIC_URL}/logo.png`
            : `${siteUrl}/assets/logo.png`;

        const response = await axios.post('https://api.flutterwave.com/v3/payments', {
            tx_ref: txRef || ('XP-FLW-' + Date.now()),
            amount: Number(amount),
            currency: currency.toUpperCase(),
            redirect_url: redirectUrl || `${siteUrl}/api/payment/verify?gateway=flutterwave`,
            customer: {
                email: customer.email,
                phonenumber: customer.phonenumber || '0000000000',
                name: customer.name
            },
            customizations: {
                title: 'XperienceStore',
                description: 'Pay for your XperienceStore order',
                logo: logoUrl
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return { success: true, data: response.data.data };
    } catch (error) {
        console.error('Flutterwave Error:', error.response ? error.response.data : error.message);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

/**
 * Verify a Flutterwave transaction after redirect
 * @param {string} transactionId - Flutterwave transaction ID (from redirect query param)
 */
const verifyPayment = async (transactionId) => {
    try {
        const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
            }
        });

        const data = response.data.data;
        if (data.status === 'successful') {
            return { success: true, status: 'completed', data };
        }
        return { success: false, status: data.status, data };
    } catch (error) {
        console.error('Flutterwave Verify Error:', error.response ? error.response.data : error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { initializePayment, verifyPayment };
