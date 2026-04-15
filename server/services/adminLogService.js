const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const db = require('../config/db');

// Reuse S3 Client configuration from environment or service
const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const AdminLogService = {
    /**
     * Offload logs to R2
     * This can be called by a cron job or when audit_logs reaches a certain size
     */
    async offloadLogsToR2() {
        try {
            const { rows: logs } = await db.query('SELECT * FROM audit_logs ORDER BY created_at ASC');
            if (logs.length === 0) return;

            const logContent = JSON.stringify(logs, null, 2);
            const fileName = `logs/audit_log_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;

            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: logContent,
                ContentType: 'application/json'
            });

            await s3.send(command);

            // After successful upload, clear the local buffer
            const lastLogId = logs[logs.length - 1].id;
            await db.query('DELETE FROM audit_logs WHERE id <= $1', [lastLogId]);

            console.log(`[LOG OFFLOAD] Successfully offloaded ${logs.length} logs to ${fileName}`);
            return fileName;
        } catch (error) {
            console.error('[LOG OFFLOAD] Error:', error);
            throw error;
        }
    },

    /**
     * Get logs for display
     */
    async getLogs(limit = 100) {
        try {
            // 1. Get recent logs from DB
            const { rows: dbLogs } = await db.query(
                'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1',
                [limit]
            );

            // 2. Get list of archive files from R2
            const archives = await this.getArchives();

            return {
                live: dbLogs,
                archives: archives
            };
        } catch (error) {
            console.error('[AUDIT LOG] Error fetching logs:', error);
            return { live: [], archives: [] };
        }
    },

    /**
     * List archive files in R2
     */
    async getArchives() {
        try {
            const command = new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET_NAME,
                Prefix: 'logs/'
            });
            const response = await s3.send(command);
            return (response.Contents || []).map(obj => ({
                key: obj.Key,
                size: obj.Size,
                lastModified: obj.LastModified
            })).sort((a, b) => b.lastModified - a.lastModified);
        } catch (error) {
            console.error('[AUDIT LOG] Error listing R2 archives:', error);
            return [];
        }
    },

    /**
     * Fetch content of a specific archive from R2
     */
    async getArchiveContent(key) {
        try {
            const command = new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key
            });
            const response = await s3.send(command);
            const content = await response.Body.transformToString();
            return JSON.parse(content);
        } catch (error) {
            console.error('[AUDIT LOG] Error fetching R2 archive:', error);
            throw error;
        }
    },

    /**
     * Record a new audit log entry
     */
    async logAction(actorId, actorName, action, target, details = null, ip = null) {
        try {
            await db.query(
                'INSERT INTO audit_logs (actor_id, actor_name, action, target, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
                [actorId, actorName, action, target, details, ip]
            );
        } catch (error) {
            console.error('[AUDIT LOG] Failed to record log:', error);
        }
    }
};

module.exports = AdminLogService;
