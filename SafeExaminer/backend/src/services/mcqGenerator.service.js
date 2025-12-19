// /SafeExaminer/SafeExaminer/backend/src/services/mcqGenerator.service.js

const QuestionModel = require('../models/Question.model');

// Function to generate random MCQs
const generateRandomMCQs = async (examId, numberOfQuestions) => {
    try {
        const questions = await QuestionModel.find({ examId }).limit(numberOfQuestions);
        return questions.map(question => ({
            id: question._id,
            question: question.text,
            options: question.options,
            correctAnswer: question.correctAnswer
        }));
    } catch (error) {
        throw new Error('Error generating MCQs: ' + error.message);
    }
};

// Function to create a new MCQ
const createMCQ = async (examId, mcqData) => {
    try {
        const newMCQ = new QuestionModel({
            examId,
            text: mcqData.question,
            options: mcqData.options,
            correctAnswer: mcqData.correctAnswer
        });
        await newMCQ.save();
        return newMCQ;
    } catch (error) {
        throw new Error('Error creating MCQ: ' + error.message);
    }
};

// Exporting the functions
module.exports = {
    generateRandomMCQs,
    createMCQ
};