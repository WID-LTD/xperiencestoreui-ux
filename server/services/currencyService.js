const axios = require('axios');
const db = require('../config/db');

/**
 * Currency Conversion Service
 * Supports real-time exchange rates with caching
 */

class CurrencyService {
    constructor() {
        this.API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'demo';
        this.BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
        this.CACHE_DURATION = 3600000; // 1 hour in milliseconds
    }

    /**
     * Get exchange rate between two currencies
     */
    async getExchangeRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return 1;

        try {
            // Check cache first
            const cachedRate = await this.getCachedRate(fromCurrency, toCurrency);
            if (cachedRate) return cachedRate;

            // Fetch fresh rate
            const response = await axios.get(`${this.BASE_URL}/${fromCurrency}`);
            const rate = response.data.rates[toCurrency];

            if (!rate) {
                throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
            }

            // Cache the rate
            await this.cacheRate(fromCurrency, toCurrency, rate);

            return rate;
        } catch (error) {
            console.error('Currency conversion error:', error);
            // Fallback to cached rate even if expired
            const fallbackRate = await this.getCachedRate(fromCurrency, toCurrency, true);
            if (fallbackRate) return fallbackRate;
            
            throw new Error('Unable to retrieve exchange rate');
        }
    }

    /**
     * Convert amount from one currency to another
     */
    async convertAmount(amount, fromCurrency, toCurrency) {
        const rate = await this.getExchangeRate(fromCurrency, toCurrency);
        return parseFloat((amount * rate).toFixed(2));
    }

    /**
     * Get cached exchange rate from database
     */
    async getCachedRate(fromCurrency, toCurrency, ignoreExpiry = false) {
        const query = ignoreExpiry 
            ? 'SELECT rate FROM currency_rates WHERE base_currency = $1 AND target_currency = $2'
            : `SELECT rate FROM currency_rates 
               WHERE base_currency = $1 AND target_currency = $2 
               AND last_updated > NOW() - INTERVAL '1 hour'`;
        
        const { rows } = await db.query(query, [fromCurrency, toCurrency]);
        return rows.length > 0 ? parseFloat(rows[0].rate) : null;
    }

    /**
     * Cache exchange rate in database
     */
    async cacheRate(fromCurrency, toCurrency, rate) {
        const query = `
            INSERT INTO currency_rates (base_currency, target_currency, rate, last_updated)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (base_currency, target_currency)
            DO UPDATE SET rate = $3, last_updated = NOW()
        `;
        await db.query(query, [fromCurrency, toCurrency, rate]);
    }

    /**
     * Get all supported currencies
     */
    getSupportedCurrencies() {
        return {
            USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
            EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
            GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
            NGN: { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
            GHS: { name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
            KES: { name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
            ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
            CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
            AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
            JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
            CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
            INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' }
        };
    }

    /**
     * Format amount with currency symbol
     */
    formatAmount(amount, currency) {
        const currencies = this.getSupportedCurrencies();
        const currencyInfo = currencies[currency] || { symbol: currency };
        return `${currencyInfo.symbol}${parseFloat(amount).toFixed(2)}`;
    }
}

module.exports = new CurrencyService();
