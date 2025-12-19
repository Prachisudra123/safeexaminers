// File: /SafeExaminer/SafeExaminer/frontend/src/hooks/useMicrophone.js

import { useEffect, useState } from 'react';

const useMicrophone = () => {
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleSuccess = (stream) => {
            setIsMicEnabled(true);
            // Additional logic to handle the microphone stream can be added here
        };

        const handleError = (err) => {
            setError(err);
            setIsMicEnabled(false);
        };

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(handleSuccess)
            .catch(handleError);

        return () => {
            // Cleanup logic if necessary
        };
    }, []);

    return { isMicEnabled, error };
};

export default useMicrophone;