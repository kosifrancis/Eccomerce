const express = require('express');

const {
    createProduct,
    getProducts,
    getProduct,
    getSellerProducts,
    updateProduct
} = require('../controllers/productController');

const { uploadImage } = require('../controllers/uploadController');
const { handleSingleImageUpload } = require('../middleware/uploadMiddleware');
const authenticateToken = require('../middleware/authMiddleware');

const {
    requireSellerRole,
    requireBuyerRole
} = require('../middleware/roleMiddleware');

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => {
    try {
        Promise.resolve(handler(req, res, next)).catch(next);
    } catch (error) {
        next(error);
    }
};

// Flexible middleware: verifies token if present, allows guest or any authenticated role to view products
const allowBrowsing = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return next();
    }
    authenticateToken(req, res, (err) => {
        if (err) return next();
        next();
    });
};

// UPLOAD PRODUCT IMAGE — SELLER ONLY
router.post(
    '/upload-image',
    asyncHandler(authenticateToken),
    asyncHandler(requireSellerRole),
    handleSingleImageUpload('image'),
    asyncHandler(uploadImage)
);

// CREATE PRODUCT — SELLER ONLY
router.post(
    '/',
    asyncHandler(authenticateToken),
    asyncHandler(requireSellerRole),
    asyncHandler(createProduct)
);

// GET SELLER OWN PRODUCTS — SELLER ONLY
router.get(
    '/seller/mine',
    asyncHandler(authenticateToken),
    asyncHandler(requireSellerRole),
    asyncHandler(getSellerProducts)
);

// UPDATE PRODUCT — SELLER ONLY
router.put(
    '/:id',
    asyncHandler(authenticateToken),
    asyncHandler(requireSellerRole),
    asyncHandler(updateProduct)
);

// GET PRODUCTS — PUBLIC, BUYER & SELLER BROWSING
router.get(
    '/',
    allowBrowsing,
    asyncHandler(getProducts)
);

router.get(
    '/:id',
    allowBrowsing,
    asyncHandler(getProduct)
);

module.exports = router;