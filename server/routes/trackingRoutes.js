const express = require('express');
const router = express.Router();
const { getTracking, updateTracking } = require('../controllers/trackingController');

// Get tracking info
router.get('/:trackingNumber', getTracking);

// Webhook for updates (optional if using external service)
router.post('/webhook', updateTracking);

module.exports = router;
