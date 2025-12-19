module.exports = {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: '1h', // Token expiration time
    algorithm: 'HS256', // JWT signing algorithm
};