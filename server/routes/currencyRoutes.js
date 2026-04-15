const express = require('express');
const router = express.Router();
const currencyService = require('../services/currencyService');

// @desc    Get supported currencies
// @route   GET /api/currency/supported
// @access  Public
router.get('/supported', (req, res) => {
    const currencies = currencyService.getSupportedCurrencies();
    res.json({ currencies });
});

// @desc    Get exchange rate
// @route   GET /api/currency/rate/:from/:to
// @access  Public
router.get('/rate/:from/:to', async (req, res) => {
    try {
        const { from, to } = req.params;
        const rate = await currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
        res.json({ from, to, rate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Convert amount
// @route   POST /api/currency/convert
// @access  Public
router.post('/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.body;
        const convertedAmount = await currencyService.convertAmount(amount, from.toUpperCase(), to.toUpperCase());
        const rate = await currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
        
        res.json({
            originalAmount: amount,
            originalCurrency: from,
            convertedAmount,
            targetCurrency: to,
            exchangeRate: rate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
