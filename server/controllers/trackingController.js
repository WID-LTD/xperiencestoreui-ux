const { getTrackingInfo, registerTracking } = require('../services/trackingService');
const { sendOrderUpdateEmail } = require('../services/emailService');

const getTracking = async (req, res) => {
    const { trackingNumber } = req.params;
    
    // In production, verify if tracking number belongs to user's order
    try {
        const trackingData = await getTrackingInfo(trackingNumber);
        
        // Mocking the result structure for frontend consumption
        // In real tracking API, adjust fields accordingly
        res.json({
            success: true,
            trackingNumber: trackingNumber,
            status: trackingData.status || 'Processing',
            events: trackingData.events || [],
            route: trackingData.route || [], // Coordinates for map
            estimatedDelivery: trackingData.estimatedDelivery
        });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ success: false, message: 'Tracking information unavailable' });
    }
};

const updateTracking = async (req, res) => {
    // Webhook receiver for 17TRACK updates
    const { number, track_info } = req.body;
    
    // Process update
    // Find order by tracking number
    // Update order status in DB
    // Send email notification

    // This is a placeholder for webhook handling logic
    res.json({ success: true });
};

module.exports = { getTracking, updateTracking };
