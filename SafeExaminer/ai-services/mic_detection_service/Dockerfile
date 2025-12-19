FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the service script
COPY service.py .

# Copy the configuration files
COPY configs/ ./configs/

# Command to run the microphone detection service
CMD ["python", "service.py"]