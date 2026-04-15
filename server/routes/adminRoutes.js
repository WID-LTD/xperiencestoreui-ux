const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllUsers,
    updateUser,
    getAllOrders,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getSettings,
    updateSettings,
    getAdminLogs,
    getAdminLogArchive,
    bulkVerifyUsers,
    broadcastNotification
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.get('/orders', getAllOrders);
router.get('/products', getAllProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/users/bulk-verify', bulkVerifyUsers);
router.post('/notifications/broadcast', broadcastNotification);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/logs', getAdminLogs);
router.get('/logs/archive', getAdminLogArchive);

module.exports = router;
