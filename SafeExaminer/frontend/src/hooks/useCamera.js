// /SafeExaminer/SafeExaminer/frontend/src/hooks/useCamera.js

import { useEffect, useState } from 'react';

const useCamera = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [videoStream, setVideoStream] = useState(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoStream(stream);
            setIsCameraActive(true);
        } catch (error) {
            console.error("Error accessing the camera: ", error);
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
            setIsCameraActive(false);
        }
    };

    useEffect(() => {
        if (isCameraActive) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isCameraActive]);

    return { isCameraActive, startCamera, stopCamera, videoStream };
};

export default useCamera;