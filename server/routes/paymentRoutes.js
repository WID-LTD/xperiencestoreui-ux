const express = require('express');
const router = express.Router();
const {
    initializePayment,
    verifyPayment,
    confirmPayment,
    getPaymentGateways,
    purchaseGiftCard,
    redeemGiftCard,
    getGiftCardBalance
} = require('../controllers/paymentController');

// Payment routes
router.post('/initialize', initializePayment);
router.post('/process', initializePayment);  // Alias used by checkout page
router.post('/confirm', confirmPayment);
router.get('/gateways', getPaymentGateways);

// Payment verification (redirect target from all gateways)
router.get('/verify', verifyPayment);

// Gift card routes
router.post('/gift-card/purchase', purchaseGiftCard);
router.post('/gift-card/redeem', redeemGiftCard);
router.get('/gift-card/balance/:userId/:currency?', getGiftCardBalance);

module.exports = router;
