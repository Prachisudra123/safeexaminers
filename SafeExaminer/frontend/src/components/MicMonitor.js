import React, { useEffect, useState } from 'react';

const MicMonitor = () => {
    const [isMicActive, setIsMicActive] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkMicrophone = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const microphone = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                microphone.connect(analyser);
                
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const checkActivity = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const isActive = dataArray.some(value => value > 0);
                    setIsMicActive(isActive);
                    requestAnimationFrame(checkActivity);
                };
                checkActivity();
            } catch (err) {
                setError('Microphone access denied or not available.');
            }
        };

        checkMicrophone();

        return () => {
            // Cleanup function to stop microphone access
            setIsMicActive(false);
        };
    }, []);

    return (
        <div className="mic-monitor">
            {error && <p className="error">{error}</p>}
            <p>Microphone is {isMicActive ? 'active' : 'inactive'}</p>
        </div>
    );
};

export default MicMonitor;