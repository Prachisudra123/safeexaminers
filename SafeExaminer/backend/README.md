# SafeExaminer Backend README

# SafeExaminer Backend

This document provides an overview of the backend application for the SafeExaminer project, which is an AI remote proctoring application. The backend is built using Node.js and Express, and it handles authentication, exam management, monitoring, and communication with the database.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Running the Application](#running-the-application)
4. [API Endpoints](#api-endpoints)
5. [Testing](#testing)
6. [Logging](#logging)
7. [Contributing](#contributing)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/SafeExaminer.git
   cd SafeExaminer/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and configure your environment variables.

## Configuration

The backend configuration is located in the `src/config` directory. Key configurations include:

- **JWT Configuration**: Located in `src/config/jwt.js`, this file contains settings for JWT authentication.
- **Database Connection**: Ensure the database connection settings are correctly set in the `.env` file.

## Running the Application

To start the backend server, run the following command:

```bash
npm start
```

Alternatively, you can use the provided script:

```bash
bash ../scripts/start-backend.sh
```

## API Endpoints

The backend exposes several API endpoints for various functionalities:

- **Authentication**: 
  - `POST /api/auth/login`: Login and receive a JWT token.
  - `POST /api/auth/register`: Register a new user.

- **Exam Management**: 
  - `GET /api/exams`: Retrieve a list of exams.
  - `POST /api/exams`: Create a new exam.

- **Monitoring**: 
  - `GET /api/monitoring`: Retrieve monitoring data.

Refer to the individual route files in `src/routes` for more detailed endpoint information.

## Testing

Unit tests for the backend are located in the `tests/backend` directory. To run the tests, use the following command:

```bash
npm test
```

## Logging

All logs, including violation logs, are stored in the `src/logs` directory. The main logging utility can be found in `src/utils/logger.js`.

## Contributing

Contributions are welcome! Please follow the standard Git workflow for submitting pull requests. Ensure that your code adheres to the project's coding standards and includes appropriate tests.

For any issues or feature requests, please open an issue in the GitHub repository.