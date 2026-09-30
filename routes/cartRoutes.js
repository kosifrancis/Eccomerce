const express = require('express');

const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', authenticateToken, addToCart);

router.get('/', authenticateToken, getCart);

router.put('/update', authenticateToken, updateCartItem);

router.delete('/remove', authenticateToken, removeFromCart);

router.delete('/clear', authenticateToken, clearCart);

module.exports = router;