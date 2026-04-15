const express = require('express');
const router = express.Router();
const { 
    getSupplierWallet, 
    getBanks, 
    resolveAccount, 
    addBankAccount, 
    getBankAccounts, 
    requestWithdrawal, 
    getPayoutHistory 
} = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

// Wallet & Transactions
router.get('/wallet', protect, getSupplierWallet);

// Bank Accounts
router.get('/banks', protect, getBanks);
router.get('/resolve-account', protect, resolveAccount);
router.get('/bank-accounts', protect, getBankAccounts);
router.post('/bank-account', protect, addBankAccount);

// Payouts
router.get('/payouts', protect, getPayoutHistory);
router.post('/payouts/request', protect, requestWithdrawal);

module.exports = router;
