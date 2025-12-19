// File: /SafeExaminer/SafeExaminer/backend/src/controllers/auth.controller.js

const AuthService = require('../services/auth.service');
const { generateToken } = require('../config/jwt');
const { handleError, handleSuccess } = require('../utils/logger');

// Register a new user
exports.register = async (req, res) => {
    try {
        const user = await AuthService.registerUser(req.body);
        const token = generateToken(user);
        handleSuccess(res, { user, token }, 'User registered successfully');
    } catch (error) {
        handleError(res, error);
    }
};

// Login a user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await AuthService.loginUser(email, password);
        const token = generateToken(user);
        handleSuccess(res, { user, token }, 'User logged in successfully');
    } catch (error) {
        handleError(res, error);
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await AuthService.getUserProfile(req.user.id);
        handleSuccess(res, user, 'User profile retrieved successfully');
    } catch (error) {
        handleError(res, error);
    }
};