const express = require('express');
const router = express.Router();
const {
    getWarehouseStats,
    getInventory,
    updateStock,
    updateOrderTracking,
    generateReceivingSlip
} = require('../controllers/warehouseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
// Warehouse can be accessed by Warehouse role or Admin
router.get('/stats', getWarehouseStats);
router.get('/inventory', getInventory);
router.get('/orders/:id/slip', generateReceivingSlip);
router.put('/inventory/:id', updateStock);
router.put('/orders/:id/tracking', updateOrderTracking);

module.exports = router;
