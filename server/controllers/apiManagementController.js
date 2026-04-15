const db = require('../config/db');
const crypto = require('crypto');

/**
 * @desc    Get all API keys for a user
 * @route   GET /api/api-management/keys
 * @access  Private
 */
const getAPIKeys = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT id, key_name, api_key, last_used_at, created_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        
        // Mask the keys before sending
        const maskedKeys = rows.map(k => ({
            ...k,
            api_key: k.api_key.substring(0, 8) + '...' + k.api_key.substring(k.api_key.length - 4)
        }));

        res.json(maskedKeys);
    } catch (error) {
        console.error('Get API Keys Error:', error);
        res.status(500).json({ message: 'Failed to fetch API keys' });
    }
};

/**
 * @desc    Generate a new API key
 * @route   POST /api/api-management/keys
 * @access  Private
 */
const generateAPIKey = async (req, res) => {
    try {
        const { keyName } = req.body;
        const userId = req.user.id;
        
        // Generate a random key
        const apiKey = 'xp_' + crypto.randomBytes(24).toString('hex');

        const { rows } = await db.query(
            'INSERT INTO api_keys (user_id, key_name, api_key) VALUES ($1, $2, $3) RETURNING id, key_name, api_key, created_at',
            [userId, keyName || 'default', apiKey]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Generate API Key Error:', error);
        res.status(500).json({ message: 'Failed to generate API key' });
    }
};

/**
 * @desc    Delete an API key
 * @route   DELETE /api/api-management/keys/:id
 * @access  Private
 */
const deleteAPIKey = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { rows } = await db.query(
            'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'API key not found' });

        res.json({ success: true, message: 'API key deleted' });
    } catch (error) {
        console.error('Delete API Key Error:', error);
        res.status(500).json({ message: 'Failed to delete API key' });
    }
};

module.exports = {
    getAPIKeys,
    generateAPIKey,
    deleteAPIKey
};
