# /SafeExaminer/SafeExaminer/db/README.md

# SafeExaminer Database Documentation

This document provides an overview of the database structure and setup for the SafeExaminer project, which is an AI remote proctoring application.

## Database Connection

The database connection is established in the `connection.js` file. Ensure that the MongoDB server is running and the connection string is correctly configured in your environment variables.

## Models

The following models are defined for the application:

- **User.model.js**: Represents the user entity, including roles and authentication details.
- **Exam.model.js**: Represents the exam entity, including details about the exam structure and questions.
- **Question.model.js**: Represents individual questions within an exam, including types and possible answers.
- **Session.model.js**: Represents a student's exam session, tracking progress and status.
- **Violation.model.js**: Represents any violations detected during an exam session, including timestamps and descriptions.

## Migrations

Migrations are managed in the `migrations` folder. The following migration scripts are available:

- **2025_01_initial_setup.js**: Initializes the database with the necessary collections and indexes.
- **2025_02_add_indexes.js**: Adds additional indexes to improve query performance.

## Seeds

Seed data can be found in the `seeds` folder. The following seed script is available:

- **initial_admin.js**: Creates an initial admin user for the application. This script should be run after the initial setup to ensure that an admin account exists.

## Usage

To set up the database:

1. Ensure MongoDB is installed and running.
2. Configure your environment variables for database connection in the `.env` file.
3. Run the migration scripts to set up the database structure.
4. Optionally, run the seed script to populate initial data.

For further details on each model and migration, please refer to the respective files in the `models` and `migrations` directories.