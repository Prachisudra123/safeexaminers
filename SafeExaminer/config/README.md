# /SafeExaminer/SafeExaminer/config/README.md

# Configuration Documentation for SafeExaminer

This document provides an overview of the configuration settings for the SafeExaminer application. Proper configuration is essential for the application to function correctly in different environments.

## Environment Variables

The application relies on environment variables for configuration. You can find example environment variable files in this directory:

- **production.env.example**: This file contains example environment variables for the production environment. Make sure to create a `.env` file in the root directory of the application and populate it with the necessary variables based on this example.

## Nginx Configuration

The Nginx configuration file is located in the `nginx` subdirectory:

- **safeexaminer.conf**: This file contains the configuration settings for Nginx to serve the SafeExaminer application. It includes settings for reverse proxying, handling static files, and managing SSL certificates.

## Usage

1. **Set Up Environment Variables**: Copy the `production.env.example` file to `.env` and modify the values as needed for your environment.
2. **Configure Nginx**: Update the `safeexaminer.conf` file with your server details and ensure it points to the correct application ports.
3. **Restart Services**: After making changes to the configuration files, restart the necessary services to apply the new settings.

For further details on specific environment variables and their purposes, refer to the comments within the example files.