const axios = require('axios');

const track17 = {
    track: async (trackingNumber) => {
        try {
            const response = await axios.post('https://api.17track.net/track/v2.2/gettrackinfo', 
                [{ number: trackingNumber }],
                {
                    headers: { '17token': process.env.TRACK17_TOKEN }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Track17 Error:', error);
            throw new Error('Tracking failed');
        }
    }
};

module.exports = track17;
