// Migration script for initial database setup for SafeExaminer project
// This script creates the necessary collections and initial data for the application.

const mongoose = require('mongoose');
const User = require('../models/User.model');
const Exam = require('../models/Exam.model');
const Question = require('../models/Question.model');
const Session = require('../models/Session.model');
const Violation = require('../models/Violation.model');

async function runMigration() {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to the database.');

        // Create initial admin user
        const adminUser = new User({
            username: 'admin',
            password: 'securepassword', // This should be hashed in a real application
            role: 'Super Admin',
        });
        await adminUser.save();
        console.log('Admin user created.');

        // Create initial exam
        const initialExam = new Exam({
            title: 'Sample Exam',
            description: 'This is a sample exam for testing purposes.',
            questions: [],
        });
        await initialExam.save();
        console.log('Initial exam created.');

        // Create initial session
        const initialSession = new Session({
            examId: initialExam._id,
            studentId: adminUser._id,
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000), // 1 hour later
        });
        await initialSession.save();
        console.log('Initial session created.');

        // Create initial violation log
        const initialViolation = new Violation({
            sessionId: initialSession._id,
            type: 'Cheating',
            description: 'Detected suspicious behavior.',
            timestamp: new Date(),
        });
        await initialViolation.save();
        console.log('Initial violation log created.');

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

runMigration();