// File: /SafeExaminer/SafeExaminer/backend/src/routes/exams.routes.js

const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares');

// Route to create a new exam
router.post('/', authMiddleware, roleMiddleware(['Super Admin', 'Exam Admin']), examController.createExam);

// Route to get all exams
router.get('/', authMiddleware, examController.getAllExams);

// Route to get a specific exam by ID
router.get('/:examId', authMiddleware, examController.getExamById);

// Route to update an exam
router.put('/:examId', authMiddleware, roleMiddleware(['Super Admin', 'Exam Admin']), examController.updateExam);

// Route to delete an exam
router.delete('/:examId', authMiddleware, roleMiddleware(['Super Admin', 'Exam Admin']), examController.deleteExam);

// Route to get questions for a specific exam
router.get('/:examId/questions', authMiddleware, examController.getExamQuestions);

// Route to add questions to a specific exam
router.post('/:examId/questions', authMiddleware, roleMiddleware(['Super Admin', 'Exam Admin']), examController.addQuestionsToExam);

module.exports = router;