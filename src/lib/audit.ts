/**
 * Audit Logger Utility
 * Automatically logs user actions across the platform for compliance and oversight
 */

export interface AuditLogParams {
    userId: string;
    userEmail: string;
    userName: string;
    role: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    status?: 'success' | 'failure';
    errorMessage?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
    try {
        await fetch('/api/audit/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Don't throw - audit logging should not break app functionality
    }
}

// Common audit actions
export const AUDIT_ACTIONS = {
    // User management
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    ROLE_CHANGED: 'role_changed',

    // Course management
    COURSE_CREATED: 'course_created',
    COURSE_UPDATED: 'course_updated',
    COURSE_DELETED: 'course_deleted',
    COURSE_APPROVED: 'course_approved',
    COURSE_REJECTED: 'course_rejected',

    // Financial
    TRANSACTION_CREATED: 'transaction_created',
    PAYOUT_APPROVED: 'payout_approved',
    REFUND_ISSUED: 'refund_issued',

    // Access
    LOGIN: 'login',
    LOGOUT: 'logout',
    PERMISSION_CHANGED: 'permission_changed',

    // Content
    CONTENT_UPLOADED: 'content_uploaded',
    CONTENT_DELETED: 'content_deleted',

    // System
    SETTINGS_CHANGED: 'settings_changed',
    FEATURE_TOGGLED: 'feature_toggled'
} as const;

export const AUDIT_RESOURCES = {
    USER: 'user',
    COURSE: 'course',
    ENROLLMENT: 'enrollment',
    TRANSACTION: 'transaction',
    CONTENT: 'content',
    SETTINGS: 'settings',
    SYSTEM: 'system'
} as const;
