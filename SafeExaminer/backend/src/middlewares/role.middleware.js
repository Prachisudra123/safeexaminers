// Role-based access control middleware for Express.js
const jwt = require('jsonwebtoken');
const { roles } = require('../../shared/constants/roles');

// Middleware to check user roles
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(403).json({ message: 'No token provided.' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized!' });
            }

            const userRole = decoded.role;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
            }

            req.userId = decoded.id;
            req.userRole = userRole;
            next();
        });
    };
};

module.exports = roleMiddleware;