const db = require('../config/db');

/**
 * @desc    Get dropshipper store details and products
 * @route   GET /api/store
 * @access  Private (Dropshipper)
 */
const getStore = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Get store details
        let { rows: storeRows } = await db.query(
            'SELECT * FROM user_stores WHERE user_id = $1',
            [userId]
        );

        if (storeRows.length === 0) {
            // Create a default store if none exists
            const defaultName = `${req.user.name}'s Store`;
            const defaultSlug = req.user.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
            
            const { rows: newStore } = await db.query(
                'INSERT INTO user_stores (user_id, store_name, store_slug) VALUES ($1, $2, $3) RETURNING *',
                [userId, defaultName, defaultSlug]
            );
            storeRows = newStore;
        }

        const store = storeRows[0];

        // 2. Get products in this store
        const { rows: products } = await db.query(`
            SELECT p.*, sp.custom_price, sp.is_active as is_in_store
            FROM store_products sp
            JOIN products p ON sp.product_id = p.id
            WHERE sp.store_id = $1
        `, [store.id]);

        res.json({
            store,
            products: products.map(p => ({
                ...p,
                price: Number(p.price),
                custom_price: p.custom_price ? Number(p.custom_price) : null
            }))
        });
    } catch (error) {
        console.error('Get Store Error:', error);
        res.status(500).json({ message: 'Failed to fetch store details' });
    }
};

/**
 * @desc    Add a product to the dropshipper's store
 * @route   POST /api/store/products
 * @access  Private (Dropshipper)
 */
const addToStore = async (req, res) => {
    try {
        const { productId, customPrice } = req.body;
        const userId = req.user.id;

        // 1. Get store ID
        const { rows: storeRows } = await db.query(
            'SELECT id FROM user_stores WHERE user_id = $1',
            [userId]
        );

        if (storeRows.length === 0) {
            return res.status(404).json({ message: 'Store not found. Please create a store first.' });
        }

        const storeId = storeRows[0].id;

        // 2. Add product to store
        const { rows } = await db.query(
            'INSERT INTO store_products (store_id, product_id, custom_price) VALUES ($1, $2, $3) ON CONFLICT (store_id, product_id) DO UPDATE SET custom_price = $3, is_active = TRUE RETURNING *',
            [storeId, productId, customPrice]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Add to Store Error:', error);
        res.status(500).json({ message: 'Failed to add product to store' });
    }
};

/**
 * @desc    Remove/Deactivate product from store
 * @route   DELETE /api/store/products/:productId
 * @access  Private (Dropshipper)
 */
const removeFromStore = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const { rows: storeRows } = await db.query(
            'SELECT id FROM user_stores WHERE user_id = $1',
            [userId]
        );

        if (storeRows.length === 0) return res.status(404).json({ message: 'Store not found' });

        await db.query(
            'UPDATE store_products SET is_active = FALSE WHERE store_id = $1 AND product_id = $2',
            [storeRows[0].id, productId]
        );

        res.json({ success: true, message: 'Product removed from store' });
    } catch (error) {
        console.error('Remove from Store Error:', error);
        res.status(500).json({ message: 'Failed to remove product' });
    }
};

/**
 * @desc    Update store settings
 * @route   PUT /api/store/settings
 * @access  Private (Dropshipper)
 */
const updateStoreSettings = async (req, res) => {
    try {
        const { store_name, store_slug, description, theme_color } = req.body;
        const userId = req.user.id;

        const { rows } = await db.query(
            `UPDATE user_stores SET 
                store_name = COALESCE($1, store_name),
                store_slug = COALESCE($2, store_slug),
                description = COALESCE($3, description),
                theme_color = COALESCE($4, theme_color),
                updated_at = NOW()
             WHERE user_id = $5 RETURNING *`,
            [store_name, store_slug, description, theme_color, userId]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Store not found' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Update Store Settings Error:', error);
        res.status(500).json({ message: 'Failed to update store settings' });
    }
};

/**
 * @desc    Get store statistics for dropshipper
 * @route   GET /api/store/stats
 * @access  Private (Dropshipper)
 */
const getStoreStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get store ID
        const { rows: storeRows } = await db.query(
            'SELECT id FROM user_stores WHERE user_id = $1',
            [userId]
        );

        if (storeRows.length === 0) {
            return res.json({
                total_products: 0,
                total_orders: 0,
                total_revenue: 0,
                active_customers: 0
            });
        }

        const storeId = storeRows[0].id;

        // 2. Total Products in Store
        const { rows: productRows } = await db.query(
            'SELECT COUNT(*) as count FROM store_products WHERE store_id = $1 AND is_active = TRUE',
            [storeId]
        );

        // 3. Orders stats (Orders where products from this store were sold)
        // Note: This depends on how orders are linked to dropshippers. 
        // Assuming orders have a 'store_id' or items have it.
        // For now, let's count orders where this user is the dropshipper.
        const { rows: orderRows } = await db.query(
            'SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM orders WHERE user_id = $1',
            [userId]
        );

        res.json({
            total_products: parseInt(productRows[0].count),
            total_orders: parseInt(orderRows[0].count),
            total_revenue: Number(orderRows[0].revenue || 0),
            active_customers: parseInt(orderRows[0].count) // Simplified for now
        });
    } catch (error) {
        console.error('Get Store Stats Error:', error);
        res.status(500).json({ message: 'Failed to fetch store statistics' });
    }
};

module.exports = {
    getStore,
    addToStore,
    removeFromStore,
    updateStoreSettings,
    getStoreStats
};
