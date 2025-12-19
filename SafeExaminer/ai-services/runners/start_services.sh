#!/bin/bash

# Start the face detection service
echo "Starting Face Detection Service..."
cd ../face_detection_service
docker build -t face_detection_service .
docker run -d --name face_detection_service face_detection_service

# Start the microphone detection service
echo "Starting Microphone Detection Service..."
cd ../mic_detection_service
docker build -t mic_detection_service .
docker run -d --name mic_detection_service mic_detection_service

echo "All AI services started successfully."