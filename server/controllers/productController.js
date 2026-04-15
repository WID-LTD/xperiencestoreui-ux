const db = require('../config/db');
const { uploadToR2, uploadToR2Deterministic } = require('../services/uploadService');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
    const { sponsored, limit, category } = req.query;
    console.log(`[GET PRODUCTS] Fetching catalog (sponsored: ${sponsored}, limit: ${limit})...`);
    try {
        let query = `
            SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.supplier_id, p.created_at, p.is_sponsored,
                   u.name as supplier_name, 
                   u.company_name as supplier_company, 
                   u.profile_image as supplier_logo 
            FROM products p 
            LEFT JOIN users u ON p.supplier_id = u.id 
        `;
        const values = [];
        const conditions = [];

        if (sponsored === 'true') {
            conditions.push('p.is_sponsored = TRUE');
        }
        if (category) {
            values.push(category);
            conditions.push(`p.category = $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.created_at DESC';

        if (limit) {
            values.push(parseInt(limit));
            query += ` LIMIT $${values.length}`;
        }

        const result = await db.query(query, values);
        console.log(`[GET PRODUCTS] Found ${result.rows.length} products.`);

        const products = result.rows.map(row => ({
            ...row,
            price: Number(row.price),
            moq: Number(row.moq) || 0,
            bulkPrice: Number(row.bulk_price) || Number(row.price),
            rating: Number(row.rating) || 0,
            reviews: Number(row.review_count) || 0,
            features: [],
            supplier: {
                id: row.supplier_id,
                name: row.supplier_company || row.supplier_name,
                logo: row.supplier_logo || 'assets/default-supplier.png',
                verified: true,
                rating: 4.8,
                reviews: 120
            }
        }));

        res.json(products);
    } catch (error) {
        console.error('[GET PRODUCTS ERROR]', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, description, price, stock, category, supplier_id, created_at FROM products WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const row = result.rows[0];
        const product = {
            ...row,
            price: Number(row.price),
            bulkPrice: Number(row.bulk_price) || Number(row.price),
            moq: Number(row.moq) || 0,
            rating: Number(row.rating) || 0,
            reviews: Number(row.review_count) || 0,
            features: []
        };
        res.json(product);
    } catch (error) {
        console.error('[GET PRODUCT BY ID ERROR]', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
    const { name, price, stock, category } = req.body;
    const supplierId = req.user.id;
    console.log(`[CREATE PRODUCT] User: ${supplierId} - Name: ${name}`);

    try {
        // 1. Insert product basic info first to get ID
        const query = `
            INSERT INTO products (name, description, price, stock, category, supplier_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const result = await db.query(query, [name, req.body.description, price, stock, category, supplierId]);
        const productId = result.rows[0].id;
        console.log(`[CREATE PRODUCT] Success DB ID: ${productId}`);

        // 2. Upload images with deterministic paths (products/{id}/{index}.jpg)
        if (req.files && req.files.length > 0) {
            console.log(`[CREATE PRODUCT] Uploading ${req.files.length} images...`);
            const uploadPromises = req.files.map((file, index) =>
                uploadToR2Deterministic(file, productId, index)
            );
            await Promise.all(uploadPromises);
            console.log(`[CREATE PRODUCT] Images uploaded successfully.`);
        }

        res.status(201).json({ id: productId, message: 'Product created successfully' });
    } catch (error) {
        console.error('[CREATE PRODUCT ERROR]', error);
        res.status(500).json({ message: 'Product creation failed' });
    }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private (Supplier Owners only)
 */
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const productId = req.params.id;
        const supplierId = req.user.id;

        // Verify ownership
        const { rows: product } = await db.query(
            'SELECT * FROM products WHERE id = $1 AND supplier_id = $2',
            [productId, supplierId]
        );

        if (product.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: You do not own this product' });
        }

        const query = `
            UPDATE products 
            SET name = $1, description = $2, price = $3, stock = $4, category = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `;
        const { rows: updated } = await db.query(query, [
            name || product[0].name,
            description || product[0].description,
            price || product[0].price,
            stock !== undefined ? stock : product[0].stock,
            category || product[0].category,
            productId
        ]);

        res.json({ success: true, message: 'Product updated successfully', product: updated[0] });
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product: ' + error.message });
    }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Supplier Owners only)
 */
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const supplierId = req.user.id;

        // First check if product is in any order
        const { rows: orderItems } = await db.query(
            'SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1',
            [productId]
        );

        if (orderItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete product that has already been ordered. Try decreasing stock to 0 instead.'
            });
        }

        // Constraints on cart_items and wishlist_items are handled by CASCADE (or manually if needed)
        // Since we updated them to CASCADE, we can just delete.

        const { rowCount } = await db.query(
            'DELETE FROM products WHERE id = $1 AND supplier_id = $2',
            [productId, supplierId]
        );

        if (rowCount === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized or product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product: ' + error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
