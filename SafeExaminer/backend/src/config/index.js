// /SafeExaminer/SafeExaminer/backend/src/config/index.js

const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    dbURI: process.env.DB_URI || 'mongodb://localhost:27017/safeexaminer',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '1h',
    logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = config;