# /SafeExaminer/SafeExaminer/ai-services/README.md

# SafeExaminer AI Services

This directory contains the AI services for the SafeExaminer application, which includes face detection and microphone detection functionalities. These services are designed to run as independent microservices or scheduled processes to ensure real-time monitoring during exams.

## Directory Structure

- **face_detection_service**: Contains the implementation for the face detection service.
  - `requirements.txt`: Lists the Python dependencies required for the face detection service.
  - `service.py`: The main script that runs the face detection logic.
  - `Dockerfile`: Docker configuration for containerizing the face detection service.
  - **configs**: Configuration files for the face detection service.
    - `face_config.yaml`: Configuration settings specific to the face detection service.

- **mic_detection_service**: Contains the implementation for the microphone detection service.
  - `requirements.txt`: Lists the Python dependencies required for the microphone detection service.
  - `service.py`: The main script that runs the microphone detection logic.
  - `Dockerfile`: Docker configuration for containerizing the microphone detection service.
  - **configs**: Configuration files for the microphone detection service.
    - `mic_config.yaml`: Configuration settings specific to the microphone detection service.

- **runners**: Contains scripts to start the AI services and manage scheduled tasks.
  - `start_services.sh`: A script to start both AI services.
  - **scheduled_jobs**: Contains scripts for scheduled monitoring tasks.
    - `scheduled_monitor.py`: A script for executing scheduled monitoring tasks.

## Usage

1. **Setup**: Ensure that the required Python dependencies are installed by running:
   ```
   pip install -r face_detection_service/requirements.txt
   pip install -r mic_detection_service/requirements.txt
   ```

2. **Running Services**: Use the `start_services.sh` script to launch the AI services:
   ```
   ./runners/start_services.sh
   ```

3. **Scheduled Monitoring**: The `scheduled_monitor.py` script can be executed to run periodic checks for monitoring purposes.

## Configuration

Adjust the configuration files located in the `configs` directories for each service to suit your environment and requirements.

## Notes

- Ensure that the necessary permissions are granted for accessing camera and microphone hardware.
- Monitor the logs for any issues during service execution.