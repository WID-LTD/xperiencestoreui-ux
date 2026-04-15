const db = require('../config/db');

const NotificationService = {
    /**
     * Send a notification to a specific user
     */
    async notifyUser(userId, title, message, type = 'info') {
        try {
            const { rows } = await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, title, message, type]
            );
            return rows[0];
        } catch (error) {
            console.error('[NOTIFICATION] Failed to send notification:', error);
            return null;
        }
    },

    /**
     * Broadcast a notification to all users or a specific role
     */
    async broadcast(title, message, type = 'info', role = null) {
        try {
            let userQuery = 'SELECT id FROM users';
            let params = [];

            if (role) {
                userQuery += ' WHERE role = $1';
                params.push(role);
            }

            const { rows: users } = await db.query(userQuery, params);

            const notificationPromises = users.map(user =>
                db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
                    [user.id, title, message, type]
                )
            );

            await Promise.all(notificationPromises);
            console.log(`[BROADCAST] Sent "${title}" to ${users.length} users`);
        } catch (error) {
            console.error('[BROADCAST] Failed to broadcast notification:', error);
        }
    },

    /**
     * Get unread notifications for a user
     */
    async getUnread(userId) {
        try {
            const { rows } = await db.query(
                'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('[NOTIFICATION] Failed to fetch notifications:', error);
            return [];
        }
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        try {
            await db.query(
                'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
                [notificationId, userId]
            );
            return true;
        } catch (error) {
            console.error('[NOTIFICATION] Failed to mark as read:', error);
            return false;
        }
    }
};

module.exports = NotificationService;
