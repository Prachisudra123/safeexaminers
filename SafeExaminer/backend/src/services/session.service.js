// File: /SafeExaminer/SafeExaminer/backend/src/services/session.service.js

const Session = require('../models/Session.model');
const { generateSessionId } = require('../utils/sessionUtils');
const { logViolation } = require('../logs/violations.log');

/**
 * Create a new session for a student.
 * @param {Object} sessionData - Data for the new session.
 * @returns {Promise<Object>} - The created session.
 */
const createSession = async (sessionData) => {
    const sessionId = generateSessionId();
    const newSession = new Session({ ...sessionData, sessionId });
    return await newSession.save();
};

/**
 * Get a session by ID.
 * @param {String} sessionId - The ID of the session to retrieve.
 * @returns {Promise<Object|null>} - The session object or null if not found.
 */
const getSessionById = async (sessionId) => {
    return await Session.findOne({ sessionId });
};

/**
 * Log a violation during a session.
 * @param {String} sessionId - The ID of the session where the violation occurred.
 * @param {String} violationDetails - Details of the violation.
 */
const logSessionViolation = async (sessionId, violationDetails) => {
    const session = await getSessionById(sessionId);
    if (session) {
        logViolation(sessionId, violationDetails);
        session.violations.push(violationDetails);
        await session.save();
    }
};

/**
 * End a session.
 * @param {String} sessionId - The ID of the session to end.
 * @returns {Promise<Object|null>} - The updated session object or null if not found.
 */
const endSession = async (sessionId) => {
    return await Session.findOneAndUpdate(
        { sessionId },
        { ended: true, endTime: new Date() },
        { new: true }
    );
};

module.exports = {
    createSession,
    getSessionById,
    logSessionViolation,
    endSession,
};