# /SafeExaminer/SafeExaminer/frontend/README.md

# SafeExaminer Frontend

Welcome to the frontend of the SafeExaminer project, an AI remote proctoring application designed to facilitate secure online examinations.

## Overview

The frontend is built using Next.js and TailwindCSS, providing a responsive and dynamic user interface. It communicates with the backend via RESTful APIs and integrates live monitoring features for camera and microphone.

## Folder Structure

- **src**: Contains the main source code for the application.
  - **pages**: Next.js pages for routing.
    - **_app.js**: Custom App component for global styles and layout.
    - **index.js**: Home page of the application.
    - **exams**: Contains exam-related pages.
      - **index.js**: Exam listing page.
      - **[examId].js**: Dynamic page for displaying specific exam details.
      - **take.js**: Page for students to take exams.
  - **components**: Reusable UI components.
    - **CameraMonitor.js**: Component for live camera monitoring.
    - **MicMonitor.js**: Component for live microphone monitoring.
    - **MCQ.js**: Component for displaying multiple-choice questions.
    - **ExamDashboard.js**: Dashboard for exam management.
    - **Layout.js**: Layout component for consistent UI structure.
  - **hooks**: Custom React hooks.
    - **useCamera.js**: Hook for managing camera functionality.
    - **useMicrophone.js**: Hook for managing microphone functionality.
  - **styles**: Global CSS styles.
    - **globals.css**: Global styles for the application.
  - **utils**: Utility functions.
    - **api.js**: Functions for making API calls.

## Installation

To get started with the frontend, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/SafeExaminer.git
   ```

2. Navigate to the frontend directory:
   ```
   cd SafeExaminer/frontend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

## Features

- Live camera and microphone monitoring during exams.
- Dynamic exam pages with multiple-choice questions.
- Responsive design using TailwindCSS.

## Testing

To run tests for the frontend, use the following command:
```
npm test
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.