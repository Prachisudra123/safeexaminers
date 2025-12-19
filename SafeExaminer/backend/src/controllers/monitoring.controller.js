// monitoring.controller.js

const MonitoringService = require('../services/monitoring.service');
const { logViolation } = require('../utils/logger');

// Function to start monitoring for a specific exam session
exports.startMonitoring = async (req, res) => {
    const { sessionId } = req.body;

    try {
        const monitoringData = await MonitoringService.startMonitoring(sessionId);
        res.status(200).json({ success: true, data: monitoringData });
    } catch (error) {
        logViolation(sessionId, error.message);
        res.status(500).json({ success: false, message: 'Failed to start monitoring' });
    }
};

// Function to stop monitoring for a specific exam session
exports.stopMonitoring = async (req, res) => {
    const { sessionId } = req.params;

    try {
        await MonitoringService.stopMonitoring(sessionId);
        res.status(200).json({ success: true, message: 'Monitoring stopped successfully' });
    } catch (error) {
        logViolation(sessionId, error.message);
        res.status(500).json({ success: false, message: 'Failed to stop monitoring' });
    }
};

// Function to get monitoring logs for a specific exam session
exports.getMonitoringLogs = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const logs = await MonitoringService.getMonitoringLogs(sessionId);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve monitoring logs' });
    }
};