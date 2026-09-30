const requireSellerRole = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({
            message: 'Access denied. Seller role required.'
        });
    }

    next();
};

const requireBuyerRole = (req, res, next) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).json({
            message: 'Access denied. Buyer role required.'
        });
    }

    next();
};

module.exports = {
    requireSellerRole,
    requireBuyerRole
};