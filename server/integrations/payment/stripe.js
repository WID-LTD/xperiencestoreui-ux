/**
 * Stripe Payment Integration
 * Uses Stripe Hosted Checkout — no frontend card form required.
 * Browser is redirected to checkout.stripe.com, then returns to success/cancel URL.
 */

// Lazy init — prevents crash if STRIPE_SECRET_KEY is placeholder
let _stripe = null;
const getStripe = () => {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('your_')) {
            return null;
        }
        _stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
    return _stripe;
};

/**
 * Create a Stripe Hosted Checkout Session.
 * Returns a `checkoutUrl` the browser can redirect to.
 */
const createCheckoutSession = async (amount, currency = 'usd', metadata = {}, successUrl, cancelUrl) => {
    try {
        const stripe = getStripe();
        if (!stripe) {
            return { success: false, error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: 'XperienceStore Order',
                        description: `Order #${metadata.orderId || 'N/A'}`,
                        images: [process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/logo.png` : undefined].filter(Boolean)
                    },
                    unit_amount: Math.round(amount * 100), // Stripe expects cents
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                platform: 'xperiencestore',
                ...Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)]))
            }
        });

        return {
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id
        };
    } catch (error) {
        console.error('Stripe Checkout Session Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verify a completed Checkout Session (called after redirect back)
 */
const verifySession = async (sessionId) => {
    try {
        const stripe = getStripe();
        if (!stripe) return { success: false, error: 'Stripe not configured' };

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            return { success: true, status: 'completed', session };
        }
        return { success: false, status: session.payment_status };
    } catch (error) {
        console.error('Stripe Verify Session Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Refund a payment intent
 */
const refundPayment = async (paymentIntentId, amount = null) => {
    try {
        const stripe = getStripe();
        if (!stripe) return { success: false, error: 'Stripe not configured' };

        const refundData = { payment_intent: paymentIntentId };
        if (amount) refundData.amount = Math.round(amount * 100);

        const refund = await stripe.refunds.create(refundData);
        return { success: true, refund };
    } catch (error) {
        console.error('Stripe Refund Error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    createCheckoutSession,
    verifySession,
    refundPayment
};
