const db = require('./config/db');
require('dotenv').config();

async function fixConstraints() {
    try {
        console.log('Adding UNIQUE constraints to cart_items and wishlist_items...');

        await db.query(`
            ALTER TABLE cart_items
            DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key,
            ADD CONSTRAINT cart_items_user_id_product_id_key UNIQUE (user_id, product_id);
        `);
        console.log('✓ Added UNIQUE constraint to cart_items');

        await db.query(`
            ALTER TABLE wishlist_items
            DROP CONSTRAINT IF EXISTS wishlist_items_user_id_product_id_key,
            ADD CONSTRAINT wishlist_items_user_id_product_id_key UNIQUE (user_id, product_id);
        `);
        console.log('✓ Added UNIQUE constraint to wishlist_items');

        console.log('Constraints fixed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

fixConstraints();
