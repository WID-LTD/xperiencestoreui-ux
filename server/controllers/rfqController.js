const db = require('../config/db');
const NotificationService = require('../services/notificationService');

/**
 * @desc    Get all RFQs
 * @route   GET /api/rfqs
 * @access  Private
 */
const getRFQs = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM rfqs WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get RFQs Error:', error);
        res.status(500).json({ message: 'Failed to fetch RFQs' });
    }
};

/**
 * @desc    Create a new RFQ
 * @route   POST /api/rfqs
 * @access  Private (Business/Dropshipper)
 */
const createRFQ = async (req, res) => {
    try {
        const { title, description, category, quantity, deadline } = req.body;
        const userId = req.user.id;

        const { rows } = await db.query(
            'INSERT INTO rfqs (user_id, title, description, category, quantity, deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, title, description, category, quantity, deadline]
        );

        // [NOTIFICATION] Notify Admin
        await NotificationService.broadcast(
            'New RFQ Created',
            `A new RFQ "${title}" has been created by ${req.user.name}.`,
            'info',
            'admin'
        );

        // [NOTIFICATION] Notify Suppliers in this category
        // This is a placeholder for a more complex notification logic
        await NotificationService.broadcast(
            'New RFQ in ${category}',
            `A new request for ${quantity} items of "${title}" is available.`,
            'info',
            'supplier'
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Create RFQ Error:', error);
        res.status(500).json({ message: 'Failed to create RFQ' });
    }
};

/**
 * @desc    Get RFQ by ID
 * @route   GET /api/rfqs/:id
 * @access  Private
 */
const getRFQById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(
            'SELECT * FROM rfqs WHERE id = $1 AND (user_id = $2 OR $3 = \'admin\' OR $3 = \'supplier\')',
            [id, req.user.id, req.user.role]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'RFQ not found' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Get RFQ By ID Error:', error);
        res.status(500).json({ message: 'Failed to fetch RFQ' });
    }
};

/**
 * @desc    Update RFQ Status
 * @route   PUT /api/rfqs/:id/status
 * @access  Private (Admin/Supplier/Owner)
 */
const updateRFQStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { rows } = await db.query(
            'UPDATE rfqs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'RFQ not found' });

        // Notify owner
        await NotificationService.notifyUser(
            rows[0].user_id,
            'RFQ Update',
            `Your RFQ "${rows[0].title}" status has been updated to ${status.toUpperCase()}.`,
            'info'
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Update RFQ Status Error:', error);
        res.status(500).json({ message: 'Failed to update RFQ' });
    }
};

module.exports = {
    getRFQs,
    createRFQ,
    getRFQById,
    updateRFQStatus
};
