// Exam model for MongoDB
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    }],
    duration: {
        type: Number,
        required: true, // Duration in minutes
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

// Middleware to update the updatedAt field before saving
examSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;