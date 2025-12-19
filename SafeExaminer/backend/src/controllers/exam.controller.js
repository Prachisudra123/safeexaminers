// File: /SafeExaminer/SafeExaminer/backend/src/controllers/exam.controller.js

const ExamService = require('../services/exam.service');
const { handleError, handleSuccess } = require('../utils/responseHandler');

// Create a new exam
exports.createExam = async (req, res) => {
    try {
        const examData = req.body;
        const newExam = await ExamService.createExam(examData);
        handleSuccess(res, 201, newExam);
    } catch (error) {
        handleError(res, error);
    }
};

// Get all exams
exports.getAllExams = async (req, res) => {
    try {
        const exams = await ExamService.getAllExams();
        handleSuccess(res, 200, exams);
    } catch (error) {
        handleError(res, error);
    }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
    try {
        const { examId } = req.params;
        const exam = await ExamService.getExamById(examId);
        if (!exam) {
            return handleError(res, { message: 'Exam not found' }, 404);
        }
        handleSuccess(res, 200, exam);
    } catch (error) {
        handleError(res, error);
    }
};

// Update an exam
exports.updateExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const examData = req.body;
        const updatedExam = await ExamService.updateExam(examId, examData);
        if (!updatedExam) {
            return handleError(res, { message: 'Exam not found' }, 404);
        }
        handleSuccess(res, 200, updatedExam);
    } catch (error) {
        handleError(res, error);
    }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const deletedExam = await ExamService.deleteExam(examId);
        if (!deletedExam) {
            return handleError(res, { message: 'Exam not found' }, 404);
        }
        handleSuccess(res, 204);
    } catch (error) {
        handleError(res, error);
    }
};