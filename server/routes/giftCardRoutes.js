const express = require('express');
const router = express.Router();
const { purchaseGiftCard, checkBalance } = require('../controllers/giftCardController');

router.post('/purchase', purchaseGiftCard);
router.get('/:code', checkBalance);

module.exports = router;
