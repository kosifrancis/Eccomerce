const express = require('express');

const {
    createProduct,
    getProducts,
    getProduct,
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

// UPDATE PRODUCT — SELLER ONLY
router.put(
    '/:id',
    asyncHandler(authenticateToken),
    asyncHandler(requireSellerRole),
    asyncHandler(updateProduct)
);

// GET PRODUCTS — BUYER ONLY
router.get(
    '/',
    asyncHandler(authenticateToken),
    asyncHandler(requireBuyerRole),
    asyncHandler(getProducts)
    
);
router.get(
    '/:id',
    asyncHandler(authenticateToken),
    asyncHandler(requireBuyerRole),
    asyncHandler(getProduct)
    
);


module.exports = router;