const db = require('../config/db');
const FinanceService = require('../services/financeService');

/**
 * @desc    Get warehouse metrics and activity
 * @route   GET /api/warehouse/stats
 * @access  Private (Warehouse/Admin)
 */
const getWarehouseStats = async (req, res) => {
    try {
        // 1. Total unique products (SKUs)
        const { rows: products } = await db.query("SELECT COUNT(*) as count FROM products");

        // 2. Pending orders (Processing status)
        const { rows: pending } = await db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'processing'");

        // 3. Shipped orders (In Transit)
        const { rows: shipped } = await db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'");

        // 4. Low stock items (Example: < 20)
        const { rows: lowStock } = await db.query("SELECT * FROM products WHERE stock < 20 LIMIT 10");

        // 5. Recent pending orders for fulfillment
        const { rows: recentOrders } = await db.query(`
            SELECT o.id, o.total_amount, o.status, u.name as customer_name, o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.status = 'processing'
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        res.json({
            total_skus: Number(products[0].count),
            pending_orders_count: Number(pending[0].count),
            in_transit_count: Number(shipped[0].count),
            low_stock_items: lowStock,
            recent_orders: recentOrders
        });
    } catch (error) {
        console.error('Warehouse Stats error:', error);
        res.status(500).json({ message: 'Failed to fetch warehouse stats' });
    }
};

/**
 * @desc    Get detailed inventory
 * @route   GET /api/warehouse/inventory
 * @access  Private (Warehouse/Admin)
 */
const getInventory = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT p.id, p.name, p.stock, p.category, p.price,
                   u.company_name as supplier_name
            FROM products p
            LEFT JOIN users u ON p.supplier_id = u.id
            ORDER BY p.name ASC
        `);
        // Note: In a full WMS, we'd join with a warehouse_inventory table for locations
        res.json(rows.map(r => ({
            ...r,
            price: Number(r.price),
            location: 'WH-A1-B2' // Placeholder until location tracking is added to DB
        })));
    } catch (error) {
        console.error('Get Inventory error:', error);
        res.status(500).json({ message: 'Failed to fetch inventory' });
    }
};

/**
 * @desc    Update product stock/location
 * @route   PUT /api/warehouse/inventory/:id
 * @access  Private (Warehouse/Admin)
 */
const updateStock = async (req, res) => {
    try {
        const { stock, location } = req.body;
        const productId = req.params.id;

        await db.query(
            'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2',
            [stock, productId]
        );

        // Location update logic would go here if we had a warehouse_inventory table

        res.json({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Update Stock error:', error);
        res.status(500).json({ message: 'Failed to update stock' });
    }
};

/**
 * @desc    Update order tracking and carrier info
 * @route   PUT /api/warehouse/orders/:id/tracking
 * @access  Private (Warehouse/Admin)
 */
const updateOrderTracking = async (req, res) => {
    try {
        const { trackingNumber, carrierCode, carrierName } = req.body;
        const orderId = req.params.id;

        await db.query(`
            UPDATE orders 
            SET tracking_number = $1, carrier_code = $2, carrier_name = $3, 
                status = 'shipped', updated_at = NOW()
            WHERE id = $4
        `, [trackingNumber, carrierCode, carrierName, orderId]);

        // Register with Track17 (Placeholder for service call)
        // await trackingService.registerTracking(trackingNumber, carrierCode);

        // Process Payouts
        await FinanceService.processOrderPayouts(orderId);

        res.json({ success: true, message: 'Order tracking updated and status set to Shipped' });
    } catch (error) {
        console.error('Update Tracking error:', error);
        res.status(500).json({ message: 'Failed to update tracking info' });
    }
};

/**
 * @desc    Generate printable receiving slip
 * @route   GET /api/warehouse/orders/:id/slip
 * @access  Private (Warehouse/Admin)
 */
const generateReceivingSlip = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { rows: orderRows } = await db.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [orderId]);

        if (!orderRows.length) return res.status(404).json({ message: 'Order not found' });

        const { rows: items } = await db.query(`
            SELECT oi.*, p.name, p.category, p.sku, s.company_name as supplier_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN users s ON p.supplier_id = s.id
            WHERE oi.order_id = $1
        `, [orderId]);

        const order = orderRows[0];
        
        // Simple HTML template for printing
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                    .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .logo { font-size: 24px; font-weight: 900; color: #2563eb; }
                    .slip-title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #64748b; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    .section-title { font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; padding: 12px; border-bottom: 1px solid #e2e8f0; }
                    td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                    .footer { margin-top: 60px; pt: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: bold; background: #dcfce7; color: #166534; text-transform: uppercase; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">XperienceStore</div>
                        <div class="slip-title">Warehouse Receiving Slip</div>
                    </div>
                    <div style="text-align: right">
                        <div class="badge">Status: ${order.status}</div>
                        <div style="font-size: 12px; margin-top: 8px">Date: ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div>
                        <div class="section-title">Order Information</div>
                        <div style="font-size: 16px; font-weight: bold">#ORD-${order.id}</div>
                        <div style="font-size: 14px">Created: ${new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                        <div class="section-title">Shipping To</div>
                        <div style="font-size: 15px; font-weight: bold">${order.customer_name}</div>
                        <div style="font-size: 13px; white-space: pre-wrap">${order.shipping_address}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Item Description</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Supplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(i => `
                            <tr>
                                <td style="font-family: monospace">${i.sku || 'N/A'}</td>
                                <td><strong>${i.name}</strong></td>
                                <td>${i.category}</td>
                                <td>${i.quantity}</td>
                                <td>${i.supplier_name || 'XperienceStore'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px">
                    <div>
                        <div class="section-title">Logistics Notes</div>
                        <p style="font-size: 13px; color: #64748b">${order.notes || 'No special handling instructions.'}</p>
                    </div>
                    <div style="border: 2px dashed #e2e8f0; padding: 20px; border-radius: 12px; text-align: center">
                        <div class="section-title">Warehouse Verification Signature</div>
                        <div style="height: 60px"></div>
                        <div style="border-top: 1px solid #94a3b8; width: 80%; margin: 0 auto"></div>
                    </div>
                </div>

                <div class="footer">
                    XperienceStore Logistics Network &copy; 2026 | Proprietary & Confidential Document
                </div>
            </body>
            <script>window.print();</script>
            </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Generate Slip error:', error);
        res.status(500).json({ message: 'Failed to generate receiving slip' });
    }
};

module.exports = {
    getWarehouseStats,
    getInventory,
    updateStock,
    updateOrderTracking,
    generateReceivingSlip
};
