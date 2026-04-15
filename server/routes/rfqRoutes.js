const express = require('express');
const router = express.Router();
const {
    getRFQs,
    createRFQ,
    getRFQById,
    updateRFQStatus
} = require('../controllers/rfqController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRFQs);
router.post('/', createRFQ);
router.get('/:id', getRFQById);
router.put('/:id/status', updateRFQStatus);

module.exports = router;
