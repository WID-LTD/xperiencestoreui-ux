const express = require('express');
const router = express.Router();
const {
    getAPIKeys,
    generateAPIKey,
    deleteAPIKey
} = require('../controllers/apiManagementController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/keys', getAPIKeys);
router.post('/keys', generateAPIKey);
router.delete('/keys/:id', deleteAPIKey);

module.exports = router;
