// /SafeExaminer/SafeExaminer/backend/src/services/exam.service.js

const Exam = require('../models/Exam.model');
const Session = require('../models/Session.model');
const Violation = require('../models/Violation.model');
const { generateRandomMCQs } = require('../services/mcqGenerator.service');

class ExamService {
    async createExam(examData) {
        const exam = new Exam(examData);
        return await exam.save();
    }

    async getExamById(examId) {
        return await Exam.findById(examId).populate('questions');
    }

    async updateExam(examId, updateData) {
        return await Exam.findByIdAndUpdate(examId, updateData, { new: true });
    }

    async deleteExam(examId) {
        return await Exam.findByIdAndDelete(examId);
    }

    async startExam(sessionData) {
        const session = new Session(sessionData);
        return await session.save();
    }

    async logViolation(violationData) {
        const violation = new Violation(violationData);
        return await violation.save();
    }

    async generateMCQs(examId, numberOfQuestions) {
        const mcqs = await generateRandomMCQs(examId, numberOfQuestions);
        return mcqs;
    }
}

module.exports = new ExamService();