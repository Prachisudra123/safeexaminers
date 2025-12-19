// This file contains middleware for authentication checks in the SafeExaminer backend application.

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { JWT_SECRET } = process.env;

// Middleware to check if the user is authenticated
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied.' });
        }

        const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid.' });
    }
};

module.exports = authMiddleware;