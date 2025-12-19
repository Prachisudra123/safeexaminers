// This file serves as the entry point for database models, exporting all models for easy access in the application.

const User = require('../../db/models/User.model');
const Exam = require('../../db/models/Exam.model');
const Question = require('../../db/models/Question.model');
const Session = require('../../db/models/Session.model');
const Violation = require('../../db/models/Violation.model');

module.exports = {
    User,
    Exam,
    Question,
    Session,
    Violation,
};