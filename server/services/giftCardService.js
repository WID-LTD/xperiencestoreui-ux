const db = require('../config/db');
const crypto = require('crypto');

/**
 * Gift Card Service
 * Handles gift card purchases, redemptions, and balance management
 */

class GiftCardService {
    /**
     * Generate unique gift card code
     */
    generateCode() {
        const prefix = 'XP';
        const random = crypto.randomBytes(6).toString('hex').toUpperCase();
        return `${prefix}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8)}`;
    }

    /**
     * Purchase/Create a gift card
     */
    async purchaseGiftCard(purchaserId, amount, currency, recipientEmail = null, expiryMonths = 12) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');

            // Generate unique code
            const code = this.generateCode();
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

            // Create gift card
            const giftCardQuery = `
                INSERT INTO gift_cards (code, balance, original_amount, currency, purchaser_id, recipient_email, expiry_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const { rows: [giftCard] } = await client.query(giftCardQuery, [
                code, amount, amount, currency, purchaserId, recipientEmail, expiryDate
            ]);

            // Record transaction
            const transactionQuery = `
                INSERT INTO gift_card_transactions (gift_card_id, user_id, transaction_type, amount, currency)
                VALUES ($1, $2, 'purchase', $3, $4)
            `;
            await client.query(transactionQuery, [giftCard.id, purchaserId, amount, currency]);

            await client.query('COMMIT');
            return { success: true, giftCard };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Gift card purchase error:', error);
            return { success: false, message: 'Failed to create gift card' };
        } finally {
            client.release();
        }
    }

    /**
     * Get gift card details by code
     */
    async getGiftCard(code) {
        const query = `
            SELECT * FROM gift_cards 
            WHERE code = $1 AND is_active = TRUE
        `;
        const { rows } = await db.query(query, [code]);
        
        if (rows.length === 0) {
            return { success: false, message: 'Gift card not found or inactive' };
        }

        const giftCard = rows[0];

        // Check expiry
        if (giftCard.expiry_date && new Date(giftCard.expiry_date) < new Date()) {
            return { success: false, message: 'Gift card has expired' };
        }

        return { success: true, giftCard };
    }

    /**
     * Redeem gift card (add to user wallet)
     */
    async redeemGiftCard(userId, code) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Get gift card
            const cardResult = await this.getGiftCard(code);
            if (!cardResult.success) {
                throw new Error(cardResult.message);
            }

            const giftCard = cardResult.giftCard;

            if (giftCard.balance <= 0) {
                throw new Error('Gift card has no remaining balance');
            }

            // Get or create user wallet
            const walletQuery = `
                INSERT INTO user_wallets (user_id, currency, gift_card_balance)
                VALUES ($1, $2, 0)
                ON CONFLICT (user_id, currency)
                DO UPDATE SET updated_at = NOW()
                RETURNING *
            `;
            const { rows: [wallet] } = await client.query(walletQuery, [userId, giftCard.currency]);

            // Update wallet balance
            const newBalance = parseFloat(wallet.gift_card_balance) + parseFloat(giftCard.balance);
            const updateWalletQuery = `
                UPDATE user_wallets 
                SET gift_card_balance = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;
            await client.query(updateWalletQuery, [newBalance, wallet.id]);

            // Record wallet transaction
            const walletTransactionQuery = `
                INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_after, reference, description)
                VALUES ($1, 'gift_card_credit', $2, $3, $4, $5)
            `;
            await client.query(walletTransactionQuery, [
                wallet.id,
                giftCard.balance,
                newBalance,
                code,
                `Gift card redemption: ${code}`
            ]);

            // Record gift card transaction
            const gcTransactionQuery = `
                INSERT INTO gift_card_transactions (gift_card_id, user_id, transaction_type, amount, currency)
                VALUES ($1, $2, 'redeem', $3, $4)
            `;
            await client.query(gcTransactionQuery, [giftCard.id, userId, giftCard.balance, giftCard.currency]);

            // Zero out gift card balance and deactivate
            await client.query('UPDATE gift_cards SET balance = 0, is_active = FALSE WHERE id = $1', [giftCard.id]);

            await client.query('COMMIT');
            return { 
                success: true, 
                message: 'Gift card redeemed successfully',
                amount: giftCard.balance,
                currency: giftCard.currency,
                newWalletBalance: newBalance
            };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Gift card redemption error:', error);
            return { success: false, message: error.message || 'Failed to redeem gift card' };
        } finally {
            client.release();
        }
    }

    /**
     * Use gift card balance for payment
     */
    async useGiftCardBalance(userId, amount, currency) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Get user wallet
            const walletQuery = `
                SELECT * FROM user_wallets 
                WHERE user_id = $1 AND currency = $2
            `;
            const { rows } = await client.query(walletQuery, [userId, currency]);

            if (rows.length === 0 || parseFloat(rows[0].gift_card_balance) < amount) {
                throw new Error('Insufficient gift card balance');
            }

            const wallet = rows[0];
            const newBalance = parseFloat(wallet.gift_card_balance) - amount;

            // Update wallet
            await client.query(
                'UPDATE user_wallets SET gift_card_balance = $1, updated_at = NOW() WHERE id = $2',
                [newBalance, wallet.id]
            );

            // Record transaction
            await client.query(
                `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_after, description)
                 VALUES ($1, 'gift_card_debit', $2, $3, $4)`,
                [wallet.id, amount, newBalance, 'Payment using gift card balance']
            );

            await client.query('COMMIT');
            return { success: true, newBalance };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Gift card payment error:', error);
            return { success: false, message: error.message };
        } finally {
            client.release();
        }
    }

    /**
     * Get user's gift card balance
     */
    async getUserGiftCardBalance(userId, currency = 'USD') {
        const query = `
            SELECT gift_card_balance FROM user_wallets
            WHERE user_id = $1 AND currency = $2
        `;
        const { rows } = await db.query(query, [userId, currency]);
        return rows.length > 0 ? parseFloat(rows[0].gift_card_balance) : 0;
    }

    /**
     * Get gift card transaction history
     */
    async getTransactionHistory(userId) {
        const query = `
            SELECT gct.*, gc.code, gc.currency
            FROM gift_card_transactions gct
            JOIN gift_cards gc ON gct.gift_card_id = gc.id
            WHERE gct.user_id = $1
            ORDER BY gct.created_at DESC
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
}

module.exports = new GiftCardService();
