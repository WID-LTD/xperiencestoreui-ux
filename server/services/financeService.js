const db = require('../config/db');

/**
 * FinanceService handles shared financial logic such as payouts and wallet operations.
 */
class FinanceService {
    /**
     * Processes payouts to suppliers for a fulfilled order.
     * Credits each supplier's wallet based on the items shipped.
     * @param {number|string} orderId - The ID of the order being fulfilled.
     */
    static async processOrderPayouts(orderId) {
        try {
            console.log(`[PAYOUT] Processing payouts for Order #${orderId}...`);
            
            // 1. Get order details (to check currency and current status)
            const { rows: orderRows } = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
            if (!orderRows.length) {
                console.error(`[PAYOUT ERROR] Order #${orderId} not found.`);
                return { success: false, message: 'Order not found' };
            }
            const order = orderRows[0];
            
            // 2. Get all items and their suppliers
            const { rows: items } = await db.query(`
                SELECT oi.price, oi.quantity, p.supplier_id, p.name as product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = $1
            `, [orderId]);

            if (items.length === 0) {
                console.warn(`[PAYOUT] No items found for Order #${orderId}.`);
                return { success: true, message: 'No items to process' };
            }

            for (const item of items) {
                const amount = Number(item.price) * item.quantity;
                const supplierId = item.supplier_id;

                if (!supplierId) {
                    console.warn(`[PAYOUT] Product ${item.product_name} in Order #${orderId} has no supplier_id. Skipping.`);
                    continue;
                }

                // 3. Find/Ensure supplier's wallet
                // We attempt to find the wallet for the order's currency, fallback to USD
                const currency = order.currency || 'USD';
                let { rows: wallets } = await db.query(
                    'SELECT id FROM user_wallets WHERE user_id = $1 AND currency = $2',
                    [supplierId, currency]
                );

                // If wallet doesn't exist, create one
                if (wallets.length === 0) {
                    console.log(`[PAYOUT] Creating ${currency} wallet for Supplier #${supplierId}`);
                    const { rows: newWallet } = await db.query(
                        'INSERT INTO user_wallets (user_id, currency, balance) VALUES ($1, $2, 0) RETURNING id',
                        [supplierId, currency]
                    );
                    wallets = newWallet;
                }

                const walletId = wallets[0].id;

                // 4. Credit wallet
                const { rows: updatedWallet } = await db.query(
                    'UPDATE user_wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
                    [amount, walletId]
                );

                // 5. Record transaction
                await db.query(
                    `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_after, description, reference)
                     VALUES ($1, 'credit', $2, $3, $4, $5)`,
                    [
                        walletId,
                        amount,
                        updatedWallet[0].balance,
                        `Payout for ${item.product_name} (Order #${orderId})`,
                        `ORD-${orderId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                    ]
                );
                
                console.log(`[PAYOUT] Credited ${currency} ${amount} to Supplier #${supplierId} for ${item.product_name}`);
            }

            return { success: true };
        } catch (error) {
            console.error('[PAYOUT ERROR]', error);
            return { success: false, error };
        }
    }
}

module.exports = FinanceService;
