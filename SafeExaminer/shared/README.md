# /SafeExaminer/SafeExaminer/shared/README.md

# SafeExaminer Shared Resources

This directory contains shared resources that are utilized across both the frontend and backend layers of the SafeExaminer project. It includes type definitions, constants, and utility functions that help maintain consistency and reduce code duplication.

## Directory Structure

- **types/**: Contains type definitions that are used for API responses and session management.
  - `apiTypes.js`: Type definitions for API responses, ensuring that the data structure is consistent across the application.
  - `sessionTypes.js`: Type definitions for session management, providing a clear structure for session-related data.

- **constants/**: Holds constant values that are used throughout the application.
  - `roles.js`: Defines constants for user roles, such as Super Admin, Exam Admin, and Student, facilitating role-based access control.
  - `statusCodes.js`: Contains constants for HTTP status codes, making it easier to manage and reference status codes in responses.

- **utils/**: Includes utility functions that are shared across different parts of the application.
  - `validators.js`: Utility functions for input validation, ensuring that data integrity is maintained before processing.

## Usage

These shared resources are designed to be imported and used in both the frontend and backend components of the SafeExaminer application. By centralizing common types, constants, and utilities, we promote code reusability and maintainability.