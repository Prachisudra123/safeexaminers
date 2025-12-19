def mic_detection_service():
    import sounddevice as sd
    import numpy as np
    import time

    # Parameters
    duration = 5  # seconds
    fs = 44100  # Sample rate

    def callback(indata, frames, time, status):
        if status:
            print(status)
        volume_norm = np.linalg.norm(indata) * 10
        print("Volume:", volume_norm)

    with sd.InputStream(callback=callback, channels=1, samplerate=fs):
        print("Monitoring microphone...")
        while True:
            time.sleep(duration)

if __name__ == "__main__":
    mic_detection_service()