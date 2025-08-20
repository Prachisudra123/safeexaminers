import React, { useState, useEffect } from 'react';
import { LogOut, Camera, Mic, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { User } from '../App';
import { questions } from '../data/questions';
import CameraFeed from './CameraFeed';

interface ExamPageProps {
  user: User;
  onSubmitExam: () => void;
  onLogout: () => void;
}

type QuestionStatus = 'not-attempted' | 'attempted' | 'marked-for-review';

const ExamPage: React.FC<ExamPageProps> = ({ user, onSubmitExam, onLogout }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [questionStatuses, setQuestionStatuses] = useState<{ [key: number]: QuestionStatus }>({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [showCamera, setShowCamera] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmitExam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion]: 'attempted'
    }));
  };

  const handleMarkForReview = () => {
    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion]: 'marked-for-review'
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getQuestionStatus = (index: number): QuestionStatus => {
    return questionStatuses[index] || 'not-attempted';
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'attempted':
        return 'bg-green-500';
      case 'marked-for-review':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getAttemptedCount = () => {
    return Object.values(questionStatuses).filter(status => status === 'attempted').length;
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Computer Science Engineering Exam</h1>
              <div className="text-sm text-gray-600">
                Student: {user.name} | ID: {user.enrollmentNo}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Camera className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Camera On</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Mic On</span>
              </div>
              <div className="text-lg font-mono font-bold text-red-600">
                {formatTime(timeRemaining)}
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestion + 1} of {questions.length}
                </h2>
                <button
                  onClick={handleMarkForReview}
                  className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition duration-200"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Mark for Review
                </button>
              </div>

              <div className="mb-8">
                <p className="text-gray-800 text-lg leading-relaxed mb-6">{question.question}</p>
                
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition duration-200"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex space-x-3">
                  {currentQuestion < questions.length - 1 ? (
                    <button
                      onClick={goToNextQuestion}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={onSubmitExam}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
                    >
                      End Exam
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Camera Feed */}
            {showCamera && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Camera Monitoring</h3>
                <CameraFeed />
              </div>
            )}

            {/* Question Navigator */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Questions Overview</h3>
              <p className="text-xs text-gray-600 mb-3">
                Attempted: {getAttemptedCount()} / {questions.length}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 text-xs font-medium rounded-md text-white transition duration-200 ${
                      index === currentQuestion
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    } ${getStatusColor(getQuestionStatus(index))}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Not Attempted</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">Marked for Review</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Attempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;