import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ExamPage from './components/ExamPage';
import SubmittedPage from './components/SubmittedPage';

export type PageType = 'login' | 'dashboard' | 'exam' | 'submitted';

export interface User {
  enrollmentNo: string;
  name: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [user, setUser] = useState<User | null>(null);
  const [examStarted, setExamStarted] = useState(false);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setExamStarted(false);
    setCurrentPage('login');
  };

  const startExam = () => {
    setExamStarted(true);
    setCurrentPage('exam');
  };

  const submitExam = () => {
    setCurrentPage('submitted');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard user={user!} onStartExam={startExam} onLogout={handleLogout} />;
      case 'exam':
        return <ExamPage user={user!} onSubmitExam={submitExam} onLogout={handleLogout} />;
      case 'submitted':
        return <SubmittedPage user={user!} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentPage()}
    </div>
  );
}

export default App;