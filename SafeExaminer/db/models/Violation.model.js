// Violation.model.js
const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
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
    violationType: {
        type: String,
        enum: ['cheating', 'disruption', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Violation = mongoose.model('Violation', violationSchema);

module.exports = Violation;