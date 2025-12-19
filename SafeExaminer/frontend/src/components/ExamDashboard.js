import React from 'react';
import { useEffect, useState } from 'react';
import { fetchExams } from '../../utils/api';
import ExamCard from '../ExamCard';

const ExamDashboard = () => {
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

    if (loading) {
        return <div>Loading exams...</div>;
    }

    if (error) {
        return <div>Error loading exams: {error}</div>;
    }

    return (
        <div className="exam-dashboard">
            <h1 className="text-2xl font-bold mb-4">Exam Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                ))}
            </div>
        </div>
    );
};

export default ExamDashboard;