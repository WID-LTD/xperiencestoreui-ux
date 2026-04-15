const express = require('express');
const router = express.Router();
const {
    getStore,
    addToStore,
    removeFromStore,
    updateStoreSettings,
    getStoreStats
} = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getStore);
router.get('/stats', getStoreStats);
router.post('/products', addToStore);
router.delete('/products/:productId', removeFromStore);
router.put('/settings', updateStoreSettings);

module.exports = router;
