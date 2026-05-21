/**
 * Audit Logger Utility (client-side)
 *
 * Posts to /api/audit/logs which derives the actor (uid/email/role) from the
 * verified Firebase ID token. Callers no longer pass user fields — they're
 * ignored server-side anyway.
 */
import { apiFetch, ApiAuthError } from './api-client';

export interface AuditLogParams {
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    status?: 'success' | 'failure';
    errorMessage?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
    try {
        await apiFetch('/api/audit/logs', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    } catch (err) {
        if (err instanceof ApiAuthError) return; // skip if signed out
        console.error('Failed to log audit:', err);
    }
}

// Common audit actions
export const AUDIT_ACTIONS = {
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    ROLE_CHANGED: 'role_changed',

    COURSE_CREATED: 'course_created',
    COURSE_UPDATED: 'course_updated',
    COURSE_DELETED: 'course_deleted',
    COURSE_APPROVED: 'course_approved',
    COURSE_REJECTED: 'course_rejected',

    TRANSACTION_CREATED: 'transaction_created',
    PAYOUT_APPROVED: 'payout_approved',
    REFUND_ISSUED: 'refund_issued',

    LOGIN: 'login',
    LOGOUT: 'logout',
    PERMISSION_CHANGED: 'permission_changed',

    CONTENT_UPLOADED: 'content_uploaded',
    CONTENT_DELETED: 'content_deleted',

    SETTINGS_CHANGED: 'settings_changed',
    FEATURE_TOGGLED: 'feature_toggled',
} as const;

export const AUDIT_RESOURCES = {
    USER: 'user',
    COURSE: 'course',
    ENROLLMENT: 'enrollment',
    TRANSACTION: 'transaction',
    CONTENT: 'content',
    SETTINGS: 'settings',
    SYSTEM: 'system',
} as const;
