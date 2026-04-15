const { Pool } = require('pg');
require('dotenv').config({ path: 'c:\\Users\\chukw\\Downloads\\xperiencestore\\xperiencestore - Copy\\server\\.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function debug() {
    try {
        const supplierId = 1; // Arbitrary ID for testing query syntax
        const query = `
            SELECT o.*, 
                   JSON_AGG(JSON_BUILD_OBJECT(
                       'id', p.id,
                       'name', p.name,
                       'quantity', oi.quantity,
                       'price', oi.price
                   )) as supplier_items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE p.supplier_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        console.log('Running query...');
        const res = await pool.query(query, [supplierId]);
        console.log('Query successful, rows:', res.rows.length);
    } catch (err) {
        console.error('Query Error:', err.message);
        console.error('Full Error:', err);
    } finally {
        await pool.end();
    }
}

debug();
