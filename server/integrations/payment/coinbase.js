const coinbase = {
    createCharge: async (amount, currency) => {
        console.log(`Creating Coinbase charge: ${amount} ${currency}`);
        return { success: true, hosted_url: 'https://commerce.coinbase.com/charges/xxx' };
    }
};
module.exports = coinbase;
