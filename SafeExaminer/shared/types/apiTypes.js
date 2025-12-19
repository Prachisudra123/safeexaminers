// This file contains type definitions for API responses used throughout the SafeExaminer application.

export const ApiResponseTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
};

export const UserRoles = {
    SUPER_ADMIN: 'super_admin',
    EXAM_ADMIN: 'exam_admin',
    STUDENT: 'student',
};

export const ExamStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const MonitoringStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    VIOLATION: 'violation',
};