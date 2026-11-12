import type { AuthContext } from '@/lib/auth-server';

/**
 * Who can watch an exam on Live Proctoring (the live feed, photos and the
 * exam room link):
 *  - admin: always;
 *  - an exam marked "admin only": nobody else;
 *  - otherwise: monitor accounts, the course registrar and the exam's creator.
 */
export function canMonitorExam(assessment: { adminOnly?: boolean; createdBy?: string } | null | undefined, auth: AuthContext): boolean {
    if (!assessment) return false;
    if (auth.role === 'admin') return true;
    if (assessment.adminOnly) return false;
    return auth.role === 'live_monitor' || auth.role === 'course_registrar' || assessment.createdBy === auth.uid;
}

/** Roles that may open Live Proctoring at all (each exam is then checked with canMonitorExam). */
export const MONITOR_ROLES = ['admin', 'instructor', 'course_registrar', 'live_monitor'] as const;

/**
 * Live-class IDs of the Zoom rooms of "admin only" exams. Only the admin may
 * see, start or join these rooms. (Server-side only.)
 */
export async function adminOnlyRoomIds(): Promise<Set<string>> {
    const { default: Assessment } = await import('@/models/Assessment');
    const rows = await Assessment.find({ adminOnly: true, proctorLiveClassId: { $exists: true, $ne: null } })
        .select('proctorLiveClassId').lean<{ proctorLiveClassId?: string }[]>();
    return new Set(rows.map(r => String(r.proctorLiveClassId)).filter(Boolean));
}
