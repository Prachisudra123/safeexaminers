// /SafeExaminer/SafeExaminer/frontend/src/utils/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const fetchData = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

const getExams = async () => {
    return fetchData('/api/exams');
};

const getExamById = async (examId) => {
    return fetchData(`/api/exams/${examId}`);
};

const submitExam = async (examId, answers) => {
    return fetchData(`/api/exams/${examId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
    });
};

const login = async (credentials) => {
    return fetchData('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

const api = {
    getExams,
    getExamById,
    submitExam,
    login,
};

export default api;