const klasha = {
    pay: async (data) => {
        console.log('Processing Klasha payment', data);
        return { success: true, id: 'KLASHA-123' };
    }
};
module.exports = klasha;
