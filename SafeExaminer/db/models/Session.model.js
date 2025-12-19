// File: /SafeExaminer/SafeExaminer/db/models/Session.model.js

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'terminated'],
        default: 'active'
    },
    violations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Violation'
    }],
    logs: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);