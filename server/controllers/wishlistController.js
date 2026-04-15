const db = require('../config/db');

// Helper: fetch full wishlist with product details
const fetchWishlist = async (userId) => {
    const { rows } = await db.query(`
        SELECT
            wi.id AS wishlist_item_id,
            wi.added_at,
            p.id AS product_id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.category,
            p.supplier_id,
            u.name AS supplier_name,
            u.company_name AS supplier_company
        FROM wishlist_items wi
        JOIN products p ON wi.product_id = p.id
        LEFT JOIN users u ON p.supplier_id = u.id
        WHERE wi.user_id = $1
        ORDER BY wi.added_at DESC
    `, [userId]);

    return rows.map(r => ({
        wishlistItemId: r.wishlist_item_id,
        id: r.product_id,
        name: r.name,
        description: r.description,
        price: Number(r.price),
        bulkPrice: Number(r.price) * 0.8,
        stock: r.stock,
        category: r.category,
        supplier: {
            id: r.supplier_id,
            name: r.supplier_company || r.supplier_name
        }
    }));
};

// @desc   Get user's wishlist
// @route  GET /api/wishlist
// @access Private
const getWishlist = async (req, res) => {
    try {
        const items = await fetchWishlist(req.user.id);
        res.json({ items, count: items.length });
    } catch (err) {
        console.error('Get wishlist error:', err);
        res.status(500).json({ message: 'Failed to fetch wishlist' });
    }
};

// @desc   Add item to wishlist
// @route  POST /api/wishlist
// @access Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ message: 'productId is required' });

        const { rows } = await db.query('SELECT id FROM products WHERE id = $1', [productId]);
        if (!rows.length) return res.status(404).json({ message: 'Product not found' });

        await db.query(`
            INSERT INTO wishlist_items (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, product_id) DO NOTHING
        `, [req.user.id, productId]);

        const items = await fetchWishlist(req.user.id);
        res.json({ success: true, items, count: items.length });
    } catch (err) {
        console.error('Add to wishlist error:', err);
        res.status(500).json({ message: 'Failed to add to wishlist' });
    }
};

// @desc   Remove item from wishlist
// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = async (req, res) => {
    try {
        await db.query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.productId]);
        const items = await fetchWishlist(req.user.id);
        res.json({ success: true, items, count: items.length });
    } catch (err) {
        console.error('Remove from wishlist error:', err);
        res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
};

// @desc   Check if product is in wishlist
// @route  GET /api/wishlist/check/:productId
// @access Private
const checkWishlist = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
            [req.user.id, req.params.productId]
        );
        res.json({ inWishlist: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ message: 'Failed to check wishlist' });
    }
};

// @desc   Sync local wishlist to DB (called on login)
// @route  POST /api/wishlist/sync
// @access Private
const syncWishlist = async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) return res.status(400).json({ message: 'productIds array required' });

        for (const productId of productIds) {
            if (!productId) continue;
            await db.query(`
                INSERT INTO wishlist_items (user_id, product_id)
                VALUES ($1, $2)
                ON CONFLICT (user_id, product_id) DO NOTHING
            `, [req.user.id, productId]);
        }

        const items = await fetchWishlist(req.user.id);
        res.json({ success: true, items, count: items.length });
    } catch (err) {
        console.error('Sync wishlist error:', err);
        res.status(500).json({ message: 'Wishlist sync failed' });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist, syncWishlist };
