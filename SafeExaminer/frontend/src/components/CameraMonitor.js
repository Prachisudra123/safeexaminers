import React, { useEffect, useRef } from 'react';

const CameraMonitor = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing the camera: ', error);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="camera-monitor">
            <video ref={videoRef} autoPlay className="w-full h-full" />
        </div>
    );
};

export default CameraMonitor;