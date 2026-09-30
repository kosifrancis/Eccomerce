const express = require('express');

const {
    createFeedback,
    getSellerFeedback
} = require('../controllers/feedbackController');

const authenticateToken = require('../middleware/authMiddleware');
const {requireSellerRole} = require('../middleware/roleMiddleware');

const router = express.Router();
router.post('/', authenticateToken, createFeedback);

router.get(
    '/seller',
    authenticateToken,
    requireSellerRole,
    getSellerFeedback
);

module.exports = router;