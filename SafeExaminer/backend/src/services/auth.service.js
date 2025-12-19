// File: /SafeExaminer/SafeExaminer/backend/src/services/auth.service.js

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { JWT_SECRET } = process.env;

// Function to register a new user
const registerUser = async (userData) => {
    const user = new User(userData);
    await user.save();
    return user;
};

// Function to authenticate a user
const authenticateUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
};

// Function to get user by ID
const getUserById = async (userId) => {
    return await User.findById(userId);
};

// Function to update user details
const updateUser = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

// Function to delete a user
const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

module.exports = {
    registerUser,
    authenticateUser,
    getUserById,
    updateUser,
    deleteUser,
};