const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMyOrders, getOrders, getOrderById, createOrder, cancelOrder
} = require('../controllers/orderController');

router.use(protect);

router.get('/', getOrders);                 // GET /api/orders (filtered by role)
router.get('/my', getMyOrders);             // GET /api/orders/my
router.get('/:id', getOrderById);           // GET /api/orders/:id
router.post('/', createOrder);              // POST /api/orders
router.put('/:id/cancel', cancelOrder);     // PUT /api/orders/:id/cancel

module.exports = router;
