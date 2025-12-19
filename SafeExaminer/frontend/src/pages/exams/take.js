import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CameraMonitor from '../../components/CameraMonitor';
import MicMonitor from '../../components/MicMonitor';
import MCQ from '../../components/MCQ';
import { fetchExamDetails, submitExam } from '../../utils/api';

const TakeExam = () => {
    const router = useRouter();
    const { examId } = router.query;
    const [examDetails, setExamDetails] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (examId) {
            const getExamDetails = async () => {
                const details = await fetchExamDetails(examId);
                setExamDetails(details);
            };
            getExamDetails();
        }
    }, [examId]);

    const handleAnswerChange = (questionId, answer) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: answer,
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await submitExam(examId, answers);
        setIsSubmitting(false);
        router.push('/exams'); // Redirect to exam listing after submission
    };

    if (!examDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="exam-container">
            <h1 className="text-2xl font-bold">{examDetails.title}</h1>
            <CameraMonitor />
            <MicMonitor />
            <div className="questions">
                {examDetails.questions.map((question) => (
                    <MCQ
                        key={question.id}
                        question={question}
                        onAnswerChange={handleAnswerChange}
                    />
                ))}
            </div>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="submit-button"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>
        </div>
    );
};

export default TakeExam;