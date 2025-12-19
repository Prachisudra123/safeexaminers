// /SafeExaminer/SafeExaminer/frontend/src/pages/exams/index.js

import React, { useEffect, useState } from 'react';
import { fetchExams } from '../../../utils/api';
import ExamDashboard from '../../../components/ExamDashboard';

const ExamsPage = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadExams = async () => {
            try {
                const examData = await fetchExams();
                setExams(examData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadExams();
    }, []);

    if (loading) return <div>Loading exams...</div>;
    if (error) return <div>Error loading exams: {error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Available Exams</h1>
            {exams.length === 0 ? (
                <p>No exams available at the moment.</p>
            ) : (
                <ExamDashboard exams={exams} />
            )}
        </div>
    );
};

export default ExamsPage;