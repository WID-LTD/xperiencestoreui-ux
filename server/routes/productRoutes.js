const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { upload } = require('../services/uploadService');

const { protect, supplier } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, supplier, upload.array('images', 5), createProduct);
router.put('/:id', protect, supplier, updateProduct);
router.delete('/:id', protect, supplier, deleteProduct);

module.exports = router;
