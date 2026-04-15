const express = require('express');
const router = express.Router();
const {
    getSupplierStats,
    getSupplierOrders,
    getSupplierProducts,
    updateOrderStatus
} = require('../controllers/supplierController');
const {
    getSupplierWallet,
    requestPayout
} = require('../controllers/financeController');
const { protect, supplier } = require('../middleware/authMiddleware');

router.use(protect);
router.use(supplier);

router.get('/stats', getSupplierStats);
router.get('/orders', getSupplierOrders);
router.get('/products', getSupplierProducts);
router.put('/orders/:id/status', updateOrderStatus);

// Finance routes
router.get('/finance/wallet', getSupplierWallet);
router.post('/finance/payout', requestPayout);

module.exports = router;

module.exports = router;
