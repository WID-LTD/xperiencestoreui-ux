const worldfirst = {
    transfer: async (details) => {
        console.log('Initiating WorldFirst transfer', details);
        return { success: true, ref: 'WF-123' };
    }
};
module.exports = worldfirst;
