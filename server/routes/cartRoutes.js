const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);              // GET /api/cart
router.post('/', addToCart);           // POST /api/cart
router.post('/sync', syncCart);        // POST /api/cart/sync  (merge localStorage on login)
router.put('/:productId', updateCartItem);       // PUT /api/cart/:productId
router.delete('/:productId', removeFromCart);    // DELETE /api/cart/:productId
router.delete('/', clearCart);         // DELETE /api/cart

module.exports = router;
