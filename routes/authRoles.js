const express = require('express');
const {
    registerUser,
    loginUser,
    forgotPassword,
    verifyOtp,
    setNewPassword,
    getCurrentUser
} = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/set-new-password', setNewPassword);
router.post('/reset-password', setNewPassword);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;