const payoneer = {
    initiatePayment: async (amount, currency) => {
        console.log(`Processing Payoneer payment: ${amount} ${currency}`);
        return { success: true, transactionId: 'PAYONEER-123' };
    }
};
module.exports = payoneer;
