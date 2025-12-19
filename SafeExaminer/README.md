# SafeExaminer

SafeExaminer is an AI-powered remote proctoring application designed to ensure the integrity of online examinations. This project leverages modern web technologies and AI services to provide a seamless and secure exam-taking experience.

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Usage Guidelines](#usage-guidelines)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
SafeExaminer aims to provide a secure online examination environment by monitoring students through their cameras and microphones, generating random multiple-choice questions (MCQs), and logging student activities. The application supports role-based access control for different user types, including Super Admin, Exam Admin, and Students.

## Technologies Used
- **Frontend**: Next.js, TailwindCSS, JavaScript
- **Backend**: Node.js, Express, JWT for authentication
- **Database**: MongoDB
- **AI Services**: Python for face and microphone detection

## Folder Structure
The project is organized into several key directories, each serving a specific purpose:

- **frontend**: Contains the Next.js application for the user interface.
- **backend**: Contains the Node.js application for handling API requests and business logic.
- **db**: Contains database models, migrations, and seed scripts for MongoDB.
- **ai-services**: Contains Python scripts for AI services related to monitoring.
- **shared**: Contains shared types, constants, and utility functions.
- **scripts**: Contains shell scripts for starting services.
- **tests**: Contains unit tests for both frontend and backend applications.
- **config**: Contains configuration files for the application.

## Setup Instructions
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/SafeExaminer.git
   cd SafeExaminer
   ```

2. Install dependencies for the frontend:
   ```
   cd frontend
   npm install
   ```

3. Install dependencies for the backend:
   ```
   cd ../backend
   npm install
   ```

4. Set up the database connection by configuring the `.env` files based on the `.env.example` files provided.

5. Start the services:
   ```
   cd scripts
   ./start-all.sh
   ```

## Usage Guidelines
- Access the frontend application through your web browser at `http://localhost:3000`.
- Use the backend API for managing exams, users, and monitoring activities.
- Ensure that the AI services are running to enable live monitoring features.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.