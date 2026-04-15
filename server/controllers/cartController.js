const db = require('../config/db');

// Helper: fetch full cart with product details for a user
const fetchCart = async (userId) => {
    const { rows } = await db.query(`
        SELECT
            ci.id AS cart_item_id,
            ci.quantity,
            ci.added_at,
            p.id AS product_id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.category,
            p.supplier_id,
            u.name AS supplier_name,
            u.company_name AS supplier_company
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN users u ON p.supplier_id = u.id
        WHERE ci.user_id = $1
        ORDER BY ci.added_at DESC
    `, [userId]);

    return rows.map(r => ({
        cartItemId: r.cart_item_id,
        id: r.product_id,
        name: r.name,
        description: r.description,
        price: Number(r.price),
        bulkPrice: Number(r.price) * 0.8,
        stock: r.stock,
        category: r.category,
        quantity: r.quantity,
        supplier: {
            id: r.supplier_id,
            name: r.supplier_company || r.supplier_name
        }
    }));
};

// @desc   Get user's cart
// @route  GET /api/cart
// @access Private
const getCart = async (req, res) => {
    try {
        const items = await fetchCart(req.user.id);
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        res.json({ items, total, count: items.reduce((s, i) => s + i.quantity, 0) });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
};

// @desc   Add item to cart (or increment quantity)
// @route  POST /api/cart
// @access Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) return res.status(400).json({ message: 'productId is required' });

        // Check product exists and has enough stock
        const { rows: products } = await db.query('SELECT id, stock FROM products WHERE id = $1', [productId]);
        if (!products.length) return res.status(404).json({ message: 'Product not found' });

        await db.query(`
            INSERT INTO cart_items (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, product_id)
            DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                          added_at = CURRENT_TIMESTAMP
        `, [req.user.id, productId, quantity]);

        const items = await fetchCart(req.user.id);
        res.json({ success: true, items, count: items.reduce((s, i) => s + i.quantity, 0) });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ message: 'Failed to add to cart' });
    }
};

// @desc   Update cart item quantity
// @route  PUT /api/cart/:productId
// @access Private
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            await db.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
        } else {
            await db.query(
                'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
                [quantity, req.user.id, productId]
            );
        }

        const items = await fetchCart(req.user.id);
        res.json({ success: true, items, count: items.reduce((s, i) => s + i.quantity, 0) });
    } catch (err) {
        console.error('Update cart item error:', err);
        res.status(500).json({ message: 'Failed to update cart' });
    }
};

// @desc   Remove item from cart
// @route  DELETE /api/cart/:productId
// @access Private
const removeFromCart = async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.productId]);
        const items = await fetchCart(req.user.id);
        res.json({ success: true, items, count: items.reduce((s, i) => s + i.quantity, 0) });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ message: 'Failed to remove from cart' });
    }
};

// @desc   Clear entire cart
// @route  DELETE /api/cart
// @access Private
const clearCart = async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
        res.json({ success: true, items: [], count: 0 });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ message: 'Failed to clear cart' });
    }
};

// @desc   Sync local cart to DB (called on login)
// @route  POST /api/cart/sync
// @access Private
const syncCart = async (req, res) => {
    try {
        const { items } = req.body; // [{ productId, quantity }]
        if (!Array.isArray(items)) return res.status(400).json({ message: 'items array required' });

        for (const item of items) {
            if (!item.productId || !item.quantity) continue;
            await db.query(`
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET quantity = GREATEST(cart_items.quantity, EXCLUDED.quantity)
            `, [req.user.id, item.productId, item.quantity]);
        }

        const dbItems = await fetchCart(req.user.id);
        res.json({ success: true, items: dbItems, count: dbItems.reduce((s, i) => s + i.quantity, 0) });
    } catch (err) {
        console.error('Sync cart error:', err);
        res.status(500).json({ message: 'Cart sync failed' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart };
