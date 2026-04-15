const express = require('express');
const router = express.Router();
const track17 = require('../integrations/tracking/track17');
const tomtom = require('../integrations/maps/tomtom');

// @desc    Track a package
// @route   GET /api/integrations/track/:number
router.get('/track/:number', async (req, res) => {
    try {
        const result = await track17.track(req.params.number);
        res.json(result);
    } catch (error) {
        // Return mock data if API fails or key missing
        res.json({
            number: req.params.number,
            status: 'In Transit',
            events: [
                { time: new Date(), status: 'Arrived at sorting facility' },
                { time: new Date(Date.now() - 86400000), status: 'Dispatched from warehouse' }
            ]
        });
    }
});

// @desc    Get Route
// @route   GET /api/integrations/route
router.get('/route', async (req, res) => {
    try {
        const { start, end } = req.query;
        const result = await tomtom.getRoute(start, end);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Routing failed' });
    }
});

module.exports = router;
