const axios = require('axios');

const TRACK17_API_KEY = process.env.TRACK17_API_KEY || process.env.TRACK17_TOKEN;
const TRACK17_API_URL = 'https://api.17track.net/track/v1';

/**
 * Get Tracking Information
 * @param {string} trackingNumber 
 * @param {string} carrier (optional)
 */
const getTrackingInfo = async (trackingNumber, carrier = null) => {
    // If no API key, return mock data for demonstration
    if (!TRACK17_API_KEY) {
        return mockTrackingData(trackingNumber);
    }

    try {
        const response = await axios.post(`${TRACK17_API_URL}/gettrackinfo`, {
            number: trackingNumber,
            carrier: carrier
        }, {
            headers: { '17token': TRACK17_API_KEY }
        });

        return response.data;
    } catch (error) {
        console.error('Tracking API Error:', error);
        return mockTrackingData(trackingNumber); // Fallback to mock
    }
};

/**
 * Register Tracking Number
 * call this when order is shipped
 */
const registerTracking = async (trackingNumber, carrier) => {
    if (!TRACK17_API_KEY) return { success: true, mock: true };

    try {
        const response = await axios.post(`${TRACK17_API_URL}/register`, [{
            number: trackingNumber,
            carrier: carrier
        }], {
            headers: { '17token': TRACK17_API_KEY }
        });
        return response.data;
    } catch (error) {
        console.error('Tracking Registration Error:', error);
        return { success: false, error: error.message };
    }
};

// Mock Data Generator
const mockTrackingData = (trackingNumber) => {
    const today = new Date();
    const statuses = [
        { status: 'Delivered', detail: 'Package delivered to recipient', location: 'New York, NY', date: new Date(today.getTime() - 86400000 * 0.5) },
        { status: 'Out for Delivery', detail: 'Out for delivery', location: 'New York, NY', date: new Date(today.getTime() - 86400000 * 1) },
        { status: 'In Transit', detail: 'Arrived at local facility', location: 'New York, NY', date: new Date(today.getTime() - 86400000 * 2) },
        { status: 'In Transit', detail: 'Departed from sort facility', location: 'Newark, NJ', date: new Date(today.getTime() - 86400000 * 3) },
        { status: 'Shipped', detail: 'Package received by carrier', location: 'Los Angeles, CA', date: new Date(today.getTime() - 86400000 * 4) },
        { status: 'Confirmed', detail: 'Order confirmed', location: 'Warehouse', date: new Date(today.getTime() - 86400000 * 5) }
    ];

    // Simulate progress based on tracking number hash or random
    const progress = 3; // 0 (start) to 5 (delivered)

    return {
        number: trackingNumber,
        carrier: 'FedEx',
        status: statuses[progress].status,
        events: statuses.slice(progress), // Show events up to current
        // Coordinates for map visualization (Start -> Current -> End)
        route: [
            { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' }, // Warehouse
            { lat: 40.7357, lng: -74.1724, name: 'Newark, NJ' },       // Transit
            { lat: 40.7128, lng: -74.0060, name: 'New York, NY' }      // Destination
        ],
        estimatedDelivery: new Date(today.getTime() + 86400000 * 2).toISOString()
    };
};

module.exports = { getTrackingInfo, registerTracking };
