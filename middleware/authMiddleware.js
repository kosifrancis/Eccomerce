const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. Token is missing.'
        });
    }

    try {
        const secret = process.env.JWT_SECRET || process.env.Jwt_Secret;
        const user = jwt.verify(token, secret);

        req.user = user;
        const uid = user.userId || user.id || user._id;
        req.user.id = uid;
        req.user.userId = uid;
        req.user.user = { id: uid, userId: uid };

        next();
    } catch (error) {
        return res.status(403).json({
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = authenticateToken;