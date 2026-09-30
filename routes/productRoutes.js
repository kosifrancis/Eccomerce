const express = require('express');

const {
    createProduct,
    getProducts,
    getProduct
} = require('../controllers/productController');

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

// CREATE PRODUCT — SELLER ONLY
router.post(
    '/',
    asyncHandler(authenticateToken),
    asyncHandler(requireSellerRole),
    asyncHandler(createProduct)
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