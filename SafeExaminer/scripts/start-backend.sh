#!/bin/bash

# Navigate to the backend directory
cd ../backend

# Load environment variables
export $(cat .env.example | xargs)

# Install dependencies
npm install

# Start the backend server
npm start