/**
 * Payment Integration Module
 * Handles multi-gateway payments, currency conversion, and gift cards
 */

const API_URL = `${window.API_BASE}/api`;

export const Payment = {
    selectedCurrency: 'NGN',
    availableGateways: [],
    currencies: {},

    /**
     * Initialize payment module
     */
    async init() {
        await this.loadCurrencies();
        await this.loadPaymentGateways();
        
        // Get user's preferred currency from localStorage or detect from browser
        const savedCurrency = localStorage.getItem('preferredCurrency');
        if (savedCurrency) {
            this.selectedCurrency = savedCurrency;
        }
    },

    /**
     * Load supported currencies
     */
    async loadCurrencies() {
        try {
            const response = await fetch(`${API_URL}/currency/supported`);
            const data = await response.json();
            this.currencies = data.currencies;
        } catch (error) {
            console.error('Failed to load currencies:', error);
        }
    },

    /**
     * Load available payment gateways
     */
    async loadPaymentGateways() {
        try {
            const response = await fetch(`${API_URL}/payment/gateways`);
            const data = await response.json();
            this.availableGateways = data.gateways;
        } catch (error) {
            console.error('Failed to load payment gateways:', error);
        }
    },

    /**
     * Convert amount between currencies
     */
    async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            const response = await fetch(`${API_URL}/currency/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, from: fromCurrency, to: toCurrency })
            });
            return await response.json();
        } catch (error) {
            console.error('Currency conversion error:', error);
            return null;
        }
    },

    /**
     * Get exchange rate
     */
    async getExchangeRate(from, to) {
        try {
            const response = await fetch(`${API_URL}/currency/rate/${from}/${to}`);
            const data = await response.json();
            return data.rate;
        } catch (error) {
            console.error('Failed to get exchange rate:', error);
            return 1;
        }
    },

    /**
     * Format amount with currency
     */
    formatAmount(amount, currency) {
        const currencyInfo = this.currencies[currency];
        const numAmount = Number(amount) || 0;
        if (!currencyInfo) return `${currency} ${numAmount.toFixed(2)}`;
        return `${currencyInfo.symbol}${numAmount.toFixed(2)}`;
    },

    /**
     * Initialize payment
     */
    async initializePayment(paymentData) {
        try {
            const response = await fetch(`${API_URL}/payment/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Payment initialization error:', error);
            return { success: false, message: 'Failed to initialize payment' };
        }
    },

    /**
     * Confirm payment
     */
    async confirmPayment(transactionRef, gateway, gatewayRef) {
        try {
            const response = await fetch(`${API_URL}/payment/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionRef, gateway, gatewayRef })
            });
            return await response.json();
        } catch (error) {
            console.error('Payment confirmation error:', error);
            return { success: false, message: 'Failed to confirm payment' };
        }
    },

    /**
     * Purchase gift card
     */
    async purchaseGiftCard(userId, amount, currency, recipientEmail, paymentGateway) {
        try {
            const response = await fetch(`${API_URL}/payment/gift-card/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount, currency, recipientEmail, paymentGateway })
            });
            return await response.json();
        } catch (error) {
            console.error('Gift card purchase error:', error);
            return { success: false, message: 'Failed to purchase gift card' };
        }
    },

    /**
     * Redeem gift card
     */
    async redeemGiftCard(userId, code) {
        try {
            const response = await fetch(`${API_URL}/payment/gift-card/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code })
            });
            return await response.json();
        } catch (error) {
            console.error('Gift card redemption error:', error);
            return { success: false, message: 'Failed to redeem gift card' };
        }
    },

    /**
     * Get gift card balance
     */
    async getGiftCardBalance(userId, currency = 'USD') {
        try {
            const response = await fetch(`${API_URL}/payment/gift-card/balance/${userId}/${currency}`);
            const data = await response.json();
            return data.balance;
        } catch (error) {
            console.error('Failed to get gift card balance:', error);
            return 0;
        }
    },

    /**
     * Set preferred currency
     */
    setCurrency(currency) {
        this.selectedCurrency = currency;
        localStorage.setItem('preferredCurrency', currency);
    }
};

// Make Payment available globally
window.Payment = Payment;
