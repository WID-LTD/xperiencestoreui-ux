const db = require('../config/db');
const AdminLogService = require('../services/adminLogService');
const NotificationService = require('../services/notificationService');

/**
 * @desc    Get platform-wide statistics for Admin
 */
const getAdminStats = async (req, res) => {
    try {
        // 1. Total Revenue
        const { rows: revenue } = await db.query(
            "SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid' OR payment_status = 'completed'"
        );

        // 2. User Distribution
        const { rows: users } = await db.query(
            "SELECT role, COUNT(*) as count FROM users GROUP BY role"
        );

        // 3. Active Orders
        const { rows: orders } = await db.query(
            "SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'processing', 'shipped')"
        );

        // 4. Inventory Insights
        const { rows: products } = await db.query("SELECT COUNT(*) as count FROM products");
        const { rows: lowStock } = await db.query("SELECT COUNT(*) as count FROM products WHERE stock < 10");

        // 5. Recent System Activity (from audit_logs)
        const { rows: interactions } = await db.query(`
            SELECT id, actor_name, action, target, created_at 
            FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        res.json({
            total_revenue: Number(revenue[0].total || 0),
            user_counts: users,
            total_users: users.reduce((acc, curr) => acc + Number(curr.count), 0),
            active_orders: Number(orders[0].count),
            total_products: Number(products[0].count),
            low_stock: Number(lowStock[0].count),
            recent_activity: interactions
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
};

/**
 * @desc    Get all users (Admin) with filtering
 */
const getAllUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        let query = 'SELECT id, name, email, role, is_verified, created_at FROM users';
        const values = [];

        const conditions = [];
        if (role && role !== 'all') {
            values.push(role);
            conditions.push(`role = $${values.length}`);
        }
        if (status) {
            const isVerified = status === 'active';
            values.push(isVerified);
            conditions.push(`is_verified = $${values.length}`);
        }
        if (search) {
            values.push(`%${search}%`);
            conditions.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length})`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';
        const { rows } = await db.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

/**
 * @desc    Update user (Admin) - including role
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, is_verified } = req.body;

        const { rows } = await db.query(
            'UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role), is_verified = COALESCE($3, is_verified) WHERE id = $4 RETURNING id, name, role, is_verified',
            [name, role, is_verified, id]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        // Log the action using AdminLogService
        await AdminLogService.logAction(req.user.id, req.user.name, 'UPDATE_USER', `User ID: ${id}`);

        // [NOTIFICATION] Notify User if Role or Verification changed
        await NotificationService.notifyUser(
            id,
            'Account Update',
            `Your account status has been updated. New Role: ${rows[0].role.toUpperCase()}. Verification: ${rows[0].is_verified ? 'VERIFIED' : 'PENDING'}.`,
            'info'
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Update failed' });
    }
};

/**
 * @desc    Bulk verify users (Admin)
 */
const bulkVerifyUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid user IDs' });

        await db.query('UPDATE users SET is_verified = TRUE WHERE id = ANY($1)', [userIds]);

        // Log the action
        await AdminLogService.logAction(req.user.id, req.user.name, 'BULK_VERIFY', `${userIds.length} users`);

        // Notify users
        for (const id of userIds) {
            await NotificationService.notifyUser(id, 'Account Verified', 'Your account has been verified by the administrator.', 'success');
        }

        res.json({ success: true, message: `Verified ${userIds.length} users` });
    } catch (error) {
        res.status(500).json({ message: 'Bulk verify failed' });
    }
};

/**
 * @desc    Get all orders (Admin)
 */
const getAllOrders = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

/**
 * @desc    Get all products (Admin)
 */
const getAllProducts = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT p.*, u.name as supplier_name 
            FROM products p 
            LEFT JOIN users u ON p.supplier_id = u.id 
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

/**
 * @desc    Update product (Admin) - for category and sponsorship
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, is_sponsored, price, stock } = req.body;

        const { rows } = await db.query(
            `UPDATE products SET 
                category = COALESCE($1, category), 
                is_sponsored = COALESCE($2, is_sponsored),
                price = COALESCE($3, price),
                stock = COALESCE($4, stock)
             WHERE id = $5 RETURNING *`,
            [category, is_sponsored, price, stock, id]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });

        // Log the action
        await AdminLogService.logAction(req.user.id, req.user.name, 'UPDATE_PRODUCT', `Product ID: ${id}`);

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

/**
 * @desc    Delete product (Admin)
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });

        // Log the action
        await AdminLogService.logAction(req.user.id, req.user.name, 'DELETE_PRODUCT', `Product ID: ${id}`);

        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

/**
 * @desc    Get platform settings (Admin)
 */
const getSettings = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
};

/**
 * @desc    Update platform settings (Admin)
 */
const updateSettings = async (req, res) => {
    try {
        const {
            platform_name, support_email, maintenance_mode,
            feature_registration, feature_vendor_signup,
            feature_reviews, feature_chat
        } = req.body;

        const { rows } = await db.query(
            `UPDATE settings SET 
                platform_name = $1, 
                support_email = $2, 
                maintenance_mode = $3, 
                feature_registration = $4, 
                feature_vendor_signup = $5, 
                feature_reviews = $6, 
                feature_chat = $7,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = (SELECT id FROM settings ORDER BY id DESC LIMIT 1)
             RETURNING *`,
            [
                platform_name, support_email, maintenance_mode,
                feature_registration, feature_vendor_signup,
                feature_reviews, feature_chat
            ]
        );

        // Log the action
        await AdminLogService.logAction(req.user.id, req.user.name, 'UPDATE_SETTINGS', 'Platform Settings');

        res.json(rows[0]);
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};

/**
 * @desc    Get system logs (Admin)
 */
const getAdminLogs = async (req, res) => {
    try {
        const logs = await AdminLogService.getLogs(req.query.limit || 50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch logs' });
    }
};

/**
 * @desc    Admin Broadcast Notification
 */
const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type, role } = req.body;
        if (!title || !message) return res.status(400).json({ message: 'Title and message required' });

        await NotificationService.broadcast(title, message, type || 'info', role || null);

        // Log the action
        await AdminLogService.logAction(req.user.id, req.user.name, 'BROADCAST', title);

        res.json({ success: true, message: 'Broadcast sent' });
    } catch (error) {
        res.status(500).json({ message: 'Broadcast failed' });
    }
};

/**
 * @desc    Get specific log archive content from R2
 */
const getAdminLogArchive = async (req, res) => {
    try {
        const { key } = req.query;
        if (!key) return res.status(400).json({ message: 'Archive key required' });

        const content = await AdminLogService.getArchiveContent(key);
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch archive content' });
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    updateUser,
    getAllOrders,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getSettings,
    updateSettings,
    getAdminLogs,
    getAdminLogArchive,
    bulkVerifyUsers,
    broadcastNotification
};
