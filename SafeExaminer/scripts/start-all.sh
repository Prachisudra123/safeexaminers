#!/bin/bash

# Start the backend service
echo "Starting backend service..."
cd backend
npm install
npm run start &

# Start the frontend service
echo "Starting frontend service..."
cd ../frontend
npm install
npm run dev &

# Start AI services
echo "Starting AI services..."
cd ../ai-services/face_detection_service
docker build -t face_detection_service .
docker run -d face_detection_service

cd ../mic_detection_service
docker build -t mic_detection_service .
docker run -d mic_detection_service

echo "All services are starting..."