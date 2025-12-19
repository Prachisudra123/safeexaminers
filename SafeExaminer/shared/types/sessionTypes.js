// This file contains type definitions for session management in the SafeExaminer application.

export const SessionStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    COMPLETED: 'completed',
    TERMINATED: 'terminated',
};

export const SessionRoles = {
    STUDENT: 'student',
    EXAM_ADMIN: 'exam_admin',
    SUPER_ADMIN: 'super_admin',
}; 

export const SessionEvents = {
    START: 'session_start',
    END: 'session_end',
    VIOLATION: 'session_violation',
}; 

export const SessionTypes = {
    ONLINE: 'online',
    OFFLINE: 'offline',
}; 

export const SessionLogFields = {
    TIMESTAMP: 'timestamp',
    USER_ID: 'user_id',
    ACTION: 'action',
    STATUS: 'status',
    DETAILS: 'details',
};