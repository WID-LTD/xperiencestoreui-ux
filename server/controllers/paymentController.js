const db = require('../config/db');
const crypto = require('crypto');
const currencyService = require('../services/currencyService');
const giftCardService = require('../services/giftCardService');
const stripe = require('../integrations/payment/stripe');
const paystack = require('../integrations/payment/paystack');
const flutterwave = require('../integrations/payment/flutterwave');
const paypal = require('../integrations/payment/paypal');

/**
 * Comprehensive Payment Controller
 * Handles multiple payment gateways, currencies, and gift cards
 */

const SITE_URL = process.env.SITE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || SITE_URL;

// @desc    Initialize payment with gateway selection
// @route   POST /api/payment/initialize
// @access  Private
const initializePayment = async (req, res) => {
    try {
        const {
            userId,
            amount,
            currency,
            paymentGateway,
            orderId,
            userCurrency,
            useGiftCard,
            giftCardAmount,
            callbackUrl
        } = req.body;

        // Generate unique transaction reference
        const transactionRef = `XP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

        // Convert currency if needed
        let finalAmount = amount;
        let exchangeRate = 1;
        const targetCurrency = currency || 'NGN';

        if (userCurrency && userCurrency !== targetCurrency) {
            exchangeRate = await currencyService.getExchangeRate(userCurrency, targetCurrency);
            finalAmount = await currencyService.convertAmount(amount, userCurrency, targetCurrency);
        }

        // Handle gift card usage
        let remainingAmount = finalAmount;
        let giftCardUsed = 0;

        if (useGiftCard && giftCardAmount > 0) {
            const giftCardBalance = await giftCardService.getUserGiftCardBalance(userId, targetCurrency);
            const applicableGiftCard = Math.min(giftCardAmount, giftCardBalance, finalAmount);

            if (applicableGiftCard > 0) {
                giftCardUsed = applicableGiftCard;
                remainingAmount = finalAmount - giftCardUsed;
            }
        }

        // If fully paid with gift card
        if (remainingAmount <= 0) {
            const gcResult = await giftCardService.useGiftCardBalance(userId, giftCardUsed, targetCurrency);

            if (!gcResult.success) {
                return res.status(400).json({ message: 'Gift card payment failed' });
            }

            await db.query(`
                INSERT INTO payment_transactions
                (user_id, order_id, amount, currency, payment_gateway, payment_method, transaction_reference, status)
                VALUES ($1, $2, $3, $4, 'gift_card', 'gift_card', $5, 'completed')
            `, [userId, orderId, giftCardUsed, targetCurrency, transactionRef]);

            // Update order to paid
            if (orderId) {
                await db.query(`
                    UPDATE orders SET payment_status = 'paid', status = 'processing',
                    payment_method = 'gift_card', payment_gateway = 'gift_card' WHERE id = $1
                `, [orderId]);
            }

            return res.json({
                success: true,
                message: 'Payment completed with gift card',
                transactionRef,
                method: 'gift_card',
                requiresAction: false
            });
        }

        // Initialize payment with selected gateway
        const selectedGateway = (paymentGateway || req.body.paymentMethod || 'stripe').toLowerCase();
        let paymentData;
        let gatewayResponse;

        // Build return URLs for callbacks
        const successUrl = `${FRONTEND_URL}/#/payment-status?gateway=${selectedGateway}`;
        const cancelUrl = `${FRONTEND_URL}/#/payment-status?gateway=${selectedGateway}&status=cancel`;

        // Fetch user info (needed by some gateways)
        const userResult = await db.query('SELECT email, name, phone FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        switch (selectedGateway) {
            case 'stripe':
                gatewayResponse = await stripe.createCheckoutSession(
                    remainingAmount,
                    targetCurrency,
                    { orderId, userId, transactionRef },
                    successUrl,
                    cancelUrl
                );
                if (gatewayResponse.success) {
                    paymentData = {
                        checkoutUrl: gatewayResponse.checkoutUrl,
                        sessionId: gatewayResponse.sessionId
                    };
                }
                break;

            case 'paystack':
                gatewayResponse = await paystack.initializeTransaction(
                    remainingAmount,
                    user.email,
                    transactionRef,
                    successUrl,
                    targetCurrency
                );
                if (gatewayResponse.success) {
                    paymentData = {
                        authorizationUrl: gatewayResponse.data.authorization_url,
                        reference: gatewayResponse.data.reference
                    };
                }
                break;

            case 'flutterwave':
                gatewayResponse = await flutterwave.initializePayment(
                    remainingAmount,
                    {
                        email: user.email,
                        name: user.name,
                        phonenumber: user.phone || '0000000000'
                    },
                    targetCurrency,
                    transactionRef,
                    successUrl
                );
                if (gatewayResponse.success) {
                    paymentData = {
                        paymentLink: gatewayResponse.data.link,
                        reference: transactionRef
                    };
                }
                break;

            case 'paypal':
                gatewayResponse = await paypal.createOrder(remainingAmount, targetCurrency);
                if (gatewayResponse.success) {
                    paymentData = {
                        orderId: gatewayResponse.orderId,
                        approvalLinks: gatewayResponse.links
                    };
                }
                break;

            default:
                return res.status(400).json({ message: 'Unsupported payment gateway' });
        }

        if (!gatewayResponse || !gatewayResponse.success) {
            return res.status(500).json({
                message: 'Payment initialization failed',
                error: gatewayResponse?.error
            });
        }

        // Create payment transaction record
        await db.query(`
            INSERT INTO payment_transactions
            (user_id, order_id, amount, currency, original_amount, original_currency, exchange_rate,
             payment_gateway, transaction_reference, status, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10)
        `, [
            userId, orderId, remainingAmount, targetCurrency,
            amount, userCurrency || targetCurrency, exchangeRate,
            selectedGateway, transactionRef,
            JSON.stringify({ giftCardUsed, giftCardAmount: giftCardUsed })
        ]);

        res.json({
            success: true,
            transactionRef,
            gateway: selectedGateway,
            amount: remainingAmount,
            currency: targetCurrency,
            giftCardUsed,
            paymentData,
            requiresAction: true
        });

    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({ message: 'Server error during payment initialization', error: error.message });
    }
};

// @desc    Verify payment after gateway redirect / capture PayPal
// @route   GET /api/payment/verify?gateway=&ref=&status=&reference=&transaction_id=&session_id=&token=
// @access  Public (called by redirect from gateway)
const verifyPayment = async (req, res) => {
    try {
        const { gateway, ref, status, reference, transaction_id, session_id, token } = req.query;

        // If user cancelled
        if (status === 'cancel') {
            return res.redirect(`${FRONTEND_URL}/#/payment/cancelled?ref=${ref}`);
        }

        const txRef = ref || reference;
        let verified = false;
        let gatewayRef = null;

        switch ((gateway || '').toLowerCase()) {
            case 'stripe': {
                const sid = session_id || req.query.session_id;
                if (!sid) return res.status(400).json({ message: 'Missing session_id' });
                const result = await stripe.verifySession(sid);
                verified = result.success;
                gatewayRef = sid;
                break;
            }

            case 'paystack': {
                const psRef = reference || txRef;
                if (!psRef) return res.status(400).json({ message: 'Missing reference' });
                const result = await paystack.verifyTransaction(psRef);
                verified = result.success;
                gatewayRef = psRef;
                break;
            }

            case 'flutterwave': {
                const tid = transaction_id;
                if (!tid) return res.status(400).json({ message: 'Missing transaction_id' });
                const result = await flutterwave.verifyPayment(tid);
                verified = result.success;
                gatewayRef = tid;
                break;
            }

            case 'paypal': {
                // PayPal uses token/orderID returned in redirect query
                const ppOrderId = token || req.query.token;
                if (!ppOrderId) return res.status(400).json({ message: 'Missing PayPal token' });
                const result = await paypal.captureOrder(ppOrderId);
                verified = result.success;
                gatewayRef = ppOrderId;
                break;
            }

            default:
                return res.status(400).json({ message: 'Unknown gateway' });
        }

        if (verified && txRef) {
            // Update transaction to completed
            await db.query(`
                UPDATE payment_transactions
                SET status = 'completed', gateway_reference = $1, updated_at = NOW()
                WHERE transaction_reference = $2
            `, [gatewayRef, txRef]);

            // Get transaction to find orderId
            const { rows } = await db.query(
                'SELECT * FROM payment_transactions WHERE transaction_reference = $1',
                [txRef]
            );
            const tx = rows[0];

            // Handle gift card deduction
            if (tx?.metadata?.giftCardUsed > 0) {
                await giftCardService.useGiftCardBalance(tx.user_id, tx.metadata.giftCardUsed, tx.currency);
            }

            // Update order status
            if (tx?.order_id) {
                await db.query(`
                    UPDATE orders SET payment_status = 'paid', status = 'processing',
                    payment_gateway = $1 WHERE id = $2
                `, [gateway, tx.order_id]);
            }

            return res.redirect(`${FRONTEND_URL}/#/account/orders?payment=success&ref=${txRef}`);
        }

        return res.redirect(`${FRONTEND_URL}/#/payment/failed?ref=${txRef}`);

    } catch (error) {
        console.error('Payment verify error:', error);
        return res.redirect(`${FRONTEND_URL}/#/payment/failed`);
    }
};

// @desc    Confirm payment (legacy / direct API call)
// @route   POST /api/payment/confirm
// @access  Private
const confirmPayment = async (req, res) => {
    try {
        const { transactionRef, gateway, gatewayRef } = req.body;

        await db.query(`
            UPDATE payment_transactions
            SET status = 'completed', gateway_reference = $1, updated_at = NOW()
            WHERE transaction_reference = $2
        `, [gatewayRef, transactionRef]);

        const { rows } = await db.query(
            'SELECT * FROM payment_transactions WHERE transaction_reference = $1',
            [transactionRef]
        );
        const transaction = rows[0];

        if (transaction?.metadata?.giftCardUsed > 0) {
            await giftCardService.useGiftCardBalance(
                transaction.user_id,
                transaction.metadata.giftCardUsed,
                transaction.currency
            );
        }

        if (transaction?.order_id) {
            await db.query(`
                UPDATE orders
                SET payment_status = 'paid', status = 'processing',
                    payment_method = $1, payment_gateway = $2
                WHERE id = $3
            `, [transaction.payment_method, gateway, transaction.order_id]);
        }

        res.json({ success: true, message: 'Payment confirmed successfully', transaction });

    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({ message: 'Payment confirmation failed' });
    }
};

// @desc    Get supported payment gateways with logos
// @route   GET /api/payment/gateways
// @access  Public
const getPaymentGateways = (req, res) => {
    const gateways = [
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Credit / Debit Cards (Global)',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
            currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'GHS'],
            enabled: !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('your_'))
        },
        {
            id: 'paystack',
            name: 'Paystack',
            description: 'Nigerian Payments (Cards, Bank, USSD)',
            logo: 'https://res.cloudinary.com/drdjxhyml/image/upload/v1/paystack-logo.svg',
            logoFallback: 'https://i.imgur.com/nHnfCPO.png',
            currencies: ['NGN', 'GHS', 'ZAR', 'USD'],
            enabled: !!process.env.PAYSTACK_SECRET_KEY
        },
        {
            id: 'flutterwave',
            name: 'Flutterwave',
            description: 'African Payments',
            logo: 'https://flutterwave.com/images/logo/full.svg',
            logoFallback: 'https://i.imgur.com/v7QPXKO.png',
            currencies: ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'EUR', 'GBP'],
            enabled: !!process.env.FLUTTERWAVE_SECRET_KEY
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'PayPal Wallet',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png',
            currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
            enabled: !!process.env.PAYPAL_CLIENT_ID
        },
        {
            id: 'gift_card',
            name: 'Gift Card',
            description: 'Xperiencestore Gift Card Balance',
            logo: null, // uses inline icon
            currencies: ['USD', 'EUR', 'GBP', 'NGN', 'GHS'],
            enabled: true
        }
    ];

    res.json({ gateways: gateways.filter(g => g.enabled) });
};

// @desc    Purchase gift card
// @route   POST /api/payment/gift-card/purchase
// @access  Private
const purchaseGiftCard = async (req, res) => {
    try {
        const { userId, amount, currency, recipientEmail, paymentGateway } = req.body;
        const result = await giftCardService.purchaseGiftCard(userId, amount, currency, recipientEmail);

        if (result.success) {
            res.json({ success: true, message: 'Gift card purchased successfully', giftCard: result.giftCard });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        console.error('Gift card purchase error:', error);
        res.status(500).json({ message: 'Gift card purchase failed' });
    }
};

// @desc    Redeem gift card
// @route   POST /api/payment/gift-card/redeem
// @access  Private
const redeemGiftCard = async (req, res) => {
    try {
        const { userId, code } = req.body;
        const result = await giftCardService.redeemGiftCard(userId, code);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        console.error('Gift card redemption error:', error);
        res.status(500).json({ message: 'Gift card redemption failed' });
    }
};

// @desc    Get gift card balance
// @route   GET /api/payment/gift-card/balance/:userId/:currency
// @access  Private
const getGiftCardBalance = async (req, res) => {
    try {
        const { userId, currency } = req.params;
        const balance = await giftCardService.getUserGiftCardBalance(userId, currency || 'USD');
        res.json({ balance, currency: currency || 'USD' });
    } catch (error) {
        console.error('Get gift card balance error:', error);
        res.status(500).json({ message: 'Failed to retrieve gift card balance' });
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
    confirmPayment,
    getPaymentGateways,
    purchaseGiftCard,
    redeemGiftCard,
    getGiftCardBalance
};
