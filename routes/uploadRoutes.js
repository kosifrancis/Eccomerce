const express = require('express');
const { uploadImage } = require('../controllers/uploadController');
const { handleSingleImageUpload } = require('../middleware/uploadMiddleware');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/upload/image (or POST /api/upload/product-image or POST /api/upload)
router.post('/image', authenticateToken, handleSingleImageUpload('image'), uploadImage);
router.post('/product-image', authenticateToken, handleSingleImageUpload('image'), uploadImage);
router.post('/', authenticateToken, handleSingleImageUpload('image'), uploadImage);

module.exports = router;
