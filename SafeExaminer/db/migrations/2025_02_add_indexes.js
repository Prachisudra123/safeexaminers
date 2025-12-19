// Migration script to add indexes to the database models for improved query performance.

const mongoose = require('mongoose');
const { User, Exam, Question, Session, Violation } = require('../models/index');

async function addIndexes() {
    try {
        // Example: Adding an index to the email field in the User model
        await User.createIndexes({ email: 1 });
        
        // Example: Adding an index to the examId field in the Exam model
        await Exam.createIndexes({ examId: 1 });
        
        // Example: Adding an index to the createdAt field in the Session model
        await Session.createIndexes({ createdAt: 1 });
        
        // Example: Adding an index to the violationType field in the Violation model
        await Violation.createIndexes({ violationType: 1 });
        
        console.log('Indexes added successfully');
    } catch (error) {
        console.error('Error adding indexes:', error);
    }
}

module.exports = {
    up: addIndexes,
    down: async () => {
        // Logic to remove indexes if needed
        console.log('Rollback logic for removing indexes can be implemented here.');
    }
};