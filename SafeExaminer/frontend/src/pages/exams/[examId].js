import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import ExamDashboard from '../../components/ExamDashboard';

const ExamDetail = () => {
    const router = useRouter();
    const { examId } = router.query;
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (examId) {
            const fetchExamData = async () => {
                try {
                    const response = await api.get(`/exams/${examId}`);
                    setExamData(response.data);
                } catch (err) {
                    setError('Failed to load exam data');
                } finally {
                    setLoading(false);
                }
            };

            fetchExamData();
        }
    }, [examId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold">{examData.title}</h1>
            <ExamDashboard exam={examData} />
        </div>
    );
};

export default ExamDetail;