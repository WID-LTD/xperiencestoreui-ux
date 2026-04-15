const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getWishlist, addToWishlist, removeFromWishlist, checkWishlist, syncWishlist
} = require('../controllers/wishlistController');

router.use(protect);

router.get('/', getWishlist);                        // GET /api/wishlist
router.post('/', addToWishlist);                     // POST /api/wishlist
router.post('/sync', syncWishlist);                  // POST /api/wishlist/sync
router.get('/check/:productId', checkWishlist);      // GET /api/wishlist/check/:productId
router.delete('/:productId', removeFromWishlist);    // DELETE /api/wishlist/:productId

module.exports = router;
