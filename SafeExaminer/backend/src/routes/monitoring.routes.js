// File: /SafeExaminer/SafeExaminer/backend/src/routes/monitoring.routes.js

const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoring.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Route to start monitoring for a specific exam session
router.post('/start/:sessionId', authMiddleware.verifyToken, roleMiddleware.isExamAdmin, monitoringController.startMonitoring);

// Route to stop monitoring for a specific exam session
router.post('/stop/:sessionId', authMiddleware.verifyToken, roleMiddleware.isExamAdmin, monitoringController.stopMonitoring);

// Route to get monitoring logs for a specific exam session
router.get('/logs/:sessionId', authMiddleware.verifyToken, roleMiddleware.isSuperAdmin, monitoringController.getMonitoringLogs);

// Route to get current monitoring status for a specific exam session
router.get('/status/:sessionId', authMiddleware.verifyToken, roleMiddleware.isExamAdmin, monitoringController.getMonitoringStatus);

module.exports = router;