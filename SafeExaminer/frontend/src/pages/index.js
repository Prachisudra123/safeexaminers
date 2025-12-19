import React from 'react';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to SafeExaminer</h1>
            <p className="text-lg text-center mb-8">
                Your AI-powered remote proctoring solution for secure online exams.
            </p>
            <a href="/exams" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Start Exam
            </a>
        </div>
    );
};

export default Home;