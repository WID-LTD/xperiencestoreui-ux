const paypal = require('@paypal/checkout-server-sdk');

/**
 * PayPal Payment Integration
 * Toggles between Sandbox and Live based on NODE_ENV.
 * Docs: https://developer.paypal.com/docs/checkout/
 */

// Use Live in production, Sandbox otherwise
const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    );

const client = new paypal.core.PayPalHttpClient(environment);

/**
 * Create a PayPal order — returns links including the approval URL.
 * @param {number} amount - Amount in USD (PayPal standard)
 * @param {string} currency - Currency code (default USD)
 */
const createOrder = async (amount, currency = 'USD') => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: currency.toUpperCase(),
                value: Number(amount).toFixed(2)
            },
            description: 'XperienceStore Order'
        }],
        application_context: {
            brand_name: 'XperienceStore',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW'
        }
    });

    try {
        const order = await client.execute(request);
        return {
            success: true,
            orderId: order.result.id,
            links: order.result.links
        };
    } catch (err) {
        console.error('PayPal Create Order Error:', err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Capture a PayPal order after user approval.
 * @param {string} orderId - PayPal order ID from the approval redirect
 */
const captureOrder = async (orderId) => {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        const captureStatus = capture.result.status;

        if (captureStatus === 'COMPLETED') {
            return { success: true, status: 'completed', capture: capture.result };
        }
        return { success: false, status: captureStatus };
    } catch (err) {
        console.error('PayPal Capture Error:', err.message);
        return { success: false, error: err.message };
    }
};

module.exports = { createOrder, captureOrder };
