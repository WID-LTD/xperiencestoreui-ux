const db = require('../config/db');
const FinanceService = require('../services/financeService');

/**
 * @desc    Get dashboard statistics for a supplier
 * @route   GET /api/supplier/stats
 * @access  Private (Supplier)
 */
const getSupplierStats = async (req, res) => {
    try {
        const supplierId = req.user.id;

        // 1. Total Products
        const { rows: productRows } = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE supplier_id = $1',
            [supplierId]
        );

        // 2. Orders containing this supplier's products
        const { rows: orderRows } = await db.query(`
            SELECT COUNT(DISTINCT oi.order_id) as count
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE p.supplier_id = $1
        `, [supplierId]);

        // 3. Total Revenue (from paid orders)
        const { rows: revenueRows } = await db.query(`
            SELECT SUM(oi.price * oi.quantity) as total
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE p.supplier_id = $1 AND o.payment_status = 'paid'
        `, [supplierId]);

        // 4. Low Stock count
        const { rows: lowStockRows } = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE supplier_id = $1 AND stock < 10',
            [supplierId]
        );

        res.json({
            total_products: parseInt(productRows[0].count),
            active_orders: parseInt(orderRows[0].count),
            total_revenue: Number(revenueRows[0].total || 0),
            low_stock_count: parseInt(lowStockRows[0].count)
        });
    } catch (error) {
        console.error('Supplier Stats Error:', error);
        res.status(500).json({ message: 'Failed to fetch supplier statistics' });
    }
};

/**
 * @desc    Get all orders associated with a supplier
 * @route   GET /api/supplier/orders
 * @access  Private (Supplier)
 */
const getSupplierOrders = async (req, res) => {
    try {
        const supplierId = req.user.id;

        const query = `
            SELECT o.id as order_id, o.total_amount as order_total, o.created_at, o.status,
                   JSON_AGG(JSON_BUILD_OBJECT(
                       'id', p.id,
                       'name', p.name,
                       'quantity', oi.quantity,
                       'price', oi.price
                   )) as items,
                   COUNT(oi.id) as items_count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE p.supplier_id = $1
            GROUP BY o.id, o.total_amount, o.created_at, o.status
            ORDER BY o.created_at DESC
        `;

        const { rows: orders } = await db.query(query, [supplierId]);

        // Format for frontend
        const formattedOrders = orders.map(o => ({
            ...o,
            order_total: Number(o.order_total),
            items_count: parseInt(o.items_count)
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Supplier Orders Error:', error);
        res.status(500).json({ message: 'Failed to fetch supplier orders' });
    }
};

/**
 * @desc    Update status of an order (Supplier side)
 * @route   PUT /api/supplier/orders/:id/status
 * @access  Private (Supplier)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        const supplierId = req.user.id;

        // Verify this supplier has items in this order
        const { rows: verify } = await db.query(`
            SELECT 1 FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1 AND p.supplier_id = $2
        `, [orderId, supplierId]);

        if (verify.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: You do not have products in this order' });
        }

        const validStatuses = ['pending', 'processing', 'processed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await db.query(
            "UPDATE orders SET status = $1 WHERE id = $2",
            [status, orderId]
        );

        // Process payouts if status is shipped
        if (status === 'shipped') {
            await FinanceService.processOrderPayouts(orderId);
        }

        res.json({ success: true, message: `Order status updated to ${status}` });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

/**
 * @desc    Get supplier's products
 * @route   GET /api/supplier/products
 * @access  Private (Supplier)
 */
const getSupplierProducts = async (req, res) => {
    try {
        const supplierId = req.user.id;
        const { rows: products } = await db.query(
            'SELECT * FROM products WHERE supplier_id = $1 ORDER BY created_at DESC',
            [supplierId]
        );
        res.json(products);
    } catch (error) {
        console.error('Supplier Products Error:', error);
        res.status(500).json({ message: 'Failed to fetch supplier products' });
    }
};

module.exports = {
    getSupplierStats,
    getSupplierOrders,
    getSupplierProducts,
    updateOrderStatus
};
