const db = require('../config/db');
const NotificationService = require('../services/notificationService');
const FinanceService = require('../services/financeService');

// Helper: fetch orders with their items for a user
const fetchOrdersForUser = async (userId) => {
    const { rows: orders } = await db.query(`
        SELECT o.id, o.total_amount, o.status, o.payment_status, o.shipping_address,
               o.tracking_number, o.currency, o.payment_method, o.payment_gateway,
               o.gift_card_applied, o.notes, o.created_at, o.updated_at
        FROM orders o
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
    `, [userId]);

    if (!orders.length) return [];

    // Fetch order items for all these orders
    const orderIds = orders.map(o => o.id);
    const { rows: items } = await db.query(`
        SELECT oi.order_id, oi.quantity, oi.price,
               p.id AS product_id, p.name, p.category, p.supplier_id,
               u.name AS supplier_name, u.company_name AS supplier_company
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN users u ON p.supplier_id = u.id
        WHERE oi.order_id = ANY($1::int[])
    `, [orderIds]);

    // Group items by order
    const itemsByOrder = {};
    items.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push({
            productId: item.product_id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            price: Number(item.price),
            supplier: item.supplier_company || item.supplier_name
        });
    });

    return orders.map(o => ({
        ...o,
        total_amount: Number(o.total_amount),
        items: itemsByOrder[o.id] || []
    }));
};

// @desc   Get logged-in user's orders
// @route  GET /api/orders/my
// @access Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await fetchOrdersForUser(req.user.id);
        res.json({ orders, count: orders.length });
    } catch (err) {
        console.error('Get my orders error:', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

// @desc   Get single order by ID
// @route  GET /api/orders/:id
// @access Private
const getOrderById = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Order not found' });

        const order = rows[0];
        const { rows: items } = await db.query(`
            SELECT oi.quantity, oi.price, p.id AS product_id, p.name, p.category
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `, [order.id]);

        res.json({ ...order, total_amount: Number(order.total_amount), items });
    } catch (err) {
        console.error('Get order by ID error:', err);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
};

// @desc   Create an order from the user's DB cart
// @route  POST /api/orders
// @access Private
const createOrder = async (req, res) => {
    const client = await db.connect?.() || db; // Use transaction if available

    try {
        const { shippingAddress, notes } = req.body;
        const userId = req.user.id;

        // Fetch user's cart from DB
        const { rows: cartItems } = await db.query(`
            SELECT ci.quantity, p.id AS product_id, p.price, p.stock, p.name
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = $1
        `, [userId]);

        if (!cartItems.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Validate stock
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for "${item.name}". Available: ${item.stock}`
                });
            }
        }

        // Calculate total
        const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

        // Create the order
        const { rows: orderRows } = await db.query(`
            INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_status, currency, notes)
            VALUES ($1, $2, 'pending', $3, 'unpaid', $4, $5)
            RETURNING id, currency
        `, [userId, totalAmount, shippingAddress || '', req.body.currency || 'USD', notes || null]);

        const orderId = orderRows[0].id;

        // Insert order items & deduct stock
        for (const item of cartItems) {
            await db.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)
            `, [orderId, item.product_id, item.quantity, item.price]);

            await db.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        // Clear cart after order creation
        await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

        // [NOTIFICATION] Notify User
        await NotificationService.notifyUser(
            userId,
            'Order Placed Successfully',
            `Your order #${orderId} for ${orderRows[0].currency} ${totalAmount.toLocaleString()} has been received and is being processed.`,
            'success'
        );

        // [NOTIFICATION] Notify Admin
        await NotificationService.broadcast(
            'New Order Received',
            `A new order (#${orderId}) has been placed by ${req.user.name}.`,
            'info',
            'admin'
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            orderId,
            totalAmount
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ message: 'Failed to create order' });
    }
};

// @desc   Cancel an order
// @route  PUT /api/orders/:id/cancel
// @access Private
const cancelOrder = async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
            [req.params.id, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Order not found' });

        const order = rows[0];
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({ message: `Cannot cancel an order with status: ${order.status}` });
        }

        await db.query(
            "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
            [order.id]
        );

        // Restore stock
        const { rows: items } = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [order.id]);
        for (const item of items) {
            await db.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
        }

        // [NOTIFICATION] Notify User
        await NotificationService.notifyUser(
            order.user_id,
            'Order Cancelled',
            `Your order #${order.id} has been cancelled.`,
            'error'
        );

        res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ message: 'Failed to cancel order' });
    }
};

// @desc   Update order status (Admin/Warehouse)
// @route  PUT /api/orders/:id/status
// @access Private (Admin/Warehouse)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['pending', 'processing', 'processed', 'at_warehouse', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Fetch order and current status
        const { rows: orderRows } = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (!orderRows.length) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = orderRows[0].status;

        await db.query(
            "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
            [status, orderId]
        );

        // PAYOUT LOGIC: If status changes to 'shipped' (fulfilled by warehouse)
        if (status === 'shipped' && oldStatus !== 'shipped') {
            await FinanceService.processOrderPayouts(orderId);
        }

        // [NOTIFICATION] Notify User about Status Change
        await NotificationService.notifyUser(
            orderRows[0].user_id,
            'Order Update',
            `Your order #${orderId} status has been updated to ${status.toUpperCase()}.`,
            'info'
        );

        res.json({ success: true, message: `Order status updated to ${status}` });
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

/**
 * @desc    Get orders based on role and filters
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res) => {
    try {
        const { role, status } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = `
            SELECT o.*, 
                   u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Filtering logic based on role
        if (userRole === 'admin') {
            // Admin can see everything or filter by role/status
            if (role === 'dropshipper') {
                // If admin wants to see dropshipper orders specifically
                // This might need a link between orders and dropshippers
            }
        } else if (userRole === 'dropshipper') {
            // Dropshipper sees their own orders
            query += ` AND o.user_id = $${params.length + 1}`;
            params.push(userId);
        } else if (userRole === 'supplier') {
            // Supplier sees orders containing their products
            query = `
                SELECT DISTINCT o.*, u.name as customer_name, u.email as customer_email
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN products p ON oi.product_id = p.id
                JOIN users u ON o.user_id = u.id
                WHERE p.supplier_id = $${params.length + 1}
            `;
            params.push(userId);
        } else {
            // Default to own orders for others
            query += ` AND o.user_id = $${params.length + 1}`;
            params.push(userId);
        }

        if (status) {
            query += ` AND o.status = $${params.length + 1}`;
            params.push(status);
        }

        query += ' ORDER BY o.created_at DESC';

        const { rows: orders } = await db.query(query, params);

        // Fetch items for these orders
        if (orders.length > 0) {
            const orderIds = orders.map(o => o.id);
            const { rows: items } = await db.query(`
                SELECT oi.*, p.name, p.image
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ANY($1::int[])
            `, [orderIds]);

            const ordersWithItems = orders.map(o => ({
                ...o,
                total_amount: Number(o.total_amount),
                items: items.filter(i => i.order_id === o.id)
            }));
            return res.json(ordersWithItems);
        }

        res.json([]);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

module.exports = { getMyOrders, getOrders, getOrderById, createOrder, cancelOrder, updateOrderStatus };

