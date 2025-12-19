// /SafeExaminer/SafeExaminer/backend/src/routes/index.js

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const examsRoutes = require('./exams.routes');
const monitoringRoutes = require('./monitoring.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/exams', examsRoutes);
router.use('/monitoring', monitoringRoutes);

// Export the router
module.exports = router;