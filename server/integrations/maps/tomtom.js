const axios = require('axios');

const tomtom = {
    getRoute: async (start, end) => {
        try {
            const apiKey = process.env.TOMTOM_API_KEY;
            // Example: Calculate route between two coordinates
            const url = `https://api.tomtom.com/routing/1/calculateRoute/${start}:${end}/json?key=${apiKey}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('TomTom Error:', error);
            throw new Error('Routing failed');
        }
    }
};

module.exports = tomtom;
