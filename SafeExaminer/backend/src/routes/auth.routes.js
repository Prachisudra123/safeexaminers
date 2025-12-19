// File: /SafeExaminer/SafeExaminer/backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Route for user registration
router.post('/register', authController.register);

// Route for user login
router.post('/login', authController.login);

// Route for refreshing JWT token
router.post('/refresh-token', authMiddleware.verifyToken, authController.refreshToken);

// Route for getting user profile
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

// Export the router
module.exports = router;