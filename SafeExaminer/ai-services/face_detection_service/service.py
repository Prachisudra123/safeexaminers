import cv2
import numpy as np
import yaml
import logging

# Load configuration
with open('configs/face_config.yaml', 'r') as config_file:
    config = yaml.safe_load(config_file)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceDetectionService:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(config['face_cascade_path'])
        self.video_source = config['video_source']

    def start_monitoring(self):
        cap = cv2.VideoCapture(self.video_source)

        if not cap.isOpened():
            logger.error("Error: Could not open video source.")
            return

        while True:
            ret, frame = cap.read()
            if not ret:
                logger.error("Error: Could not read frame.")
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

            cv2.imshow('Face Detection', frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    service = FaceDetectionService()
    service.start_monitoring()