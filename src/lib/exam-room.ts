import LiveClass from '@/models/LiveClass';
import { createZoomMeeting, renameZoomHost, getZoomAccessToken, ACADEMY_HOST_DISPLAY_NAME } from './zoom';
import { findAvailableZoomHost } from './zoom-scheduler';
import { getZoomAccounts } from './zoom-hosts';
import { isProctored } from './proctoring';

/** An exam's start window (opensAt → closesAt) can be at most this long. */
export const MAX_EXAM_START_WINDOW_MINUTES = 180;

export type ExamRoomResult = { ok: true; liveClassId: string; created: boolean } | { ok: false; reason: string };

/** Problems with an exam's timing/course that would stop a live exam room being created. */
export function examRoomProblem(a: { type?: string; courseId?: unknown; opensAt: Date | string; closesAt: Date | string }): string | null {
    if (!isProctored(a)) return null;
    if (!a.courseId) return 'An exam must be for a specific course so its students can join the live exam room.';
    const windowMin = (new Date(a.closesAt).getTime() - new Date(a.opensAt).getTime()) / 60000;
    if (windowMin < 0) return 'The latest start time must be after the exam start time.';
    if (windowMin > MAX_EXAM_START_WINDOW_MINUTES) {
        return `An exam is taken at a fixed time, so students can start at most ${MAX_EXAM_START_WINDOW_MINUTES / 60} hours after it opens.`;
    }
    return null;
}

async function cancelRoom(liveClassId: string) {
    const lc: any = await LiveClass.findById(liveClassId);
    if (!lc || lc.status === 'cancelled') return;
    lc.status = 'cancelled';
    await lc.save();
    try {
        const account = getZoomAccounts().find(a => a.key === lc.zoomAccountKey);
        if (account && lc.zoomMeetingId) {
            const token = await getZoomAccessToken(account);
            await fetch(`https://api.zoom.us/v2/meetings/${lc.zoomMeetingId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        }
    } catch (err) {
        console.warn('exam-room: could not delete old Zoom meeting', err);
    }
}

/**
 * Makes sure a published exam has a live Zoom exam room covering its fixed
 * sitting: from opensAt until the last student to start (at closesAt) would
 * finish. The room is an ordinary LiveClass, so recording, host start links,
 * the monitor dashboard and the embedded join all work exactly as for classes.
 * Pass `recreate` after the exam's times change.
 */
export async function ensureExamRoom(assessment: any, opts: { recreate?: boolean } = {}): Promise<ExamRoomResult> {
    if (!isProctored(assessment)) return { ok: false, reason: 'Not an exam.' };
    const problem = examRoomProblem(assessment);
    if (problem) return { ok: false, reason: problem };

    if (assessment.proctorLiveClassId) {
        const existing: any = await LiveClass.findById(assessment.proctorLiveClassId).lean();
        if (existing && existing.status !== 'cancelled' && !opts.recreate) {
            return { ok: true, liveClassId: String(existing._id), created: false };
        }
        if (existing && opts.recreate) await cancelRoom(String(existing._id));
    }

    const start = new Date(assessment.opensAt);
    const durationMinutes = Math.ceil((new Date(assessment.closesAt).getTime() - start.getTime()) / 60000) + assessment.durationMinutes + 10;

    const assignment = await findAvailableZoomHost(start, durationMinutes);
    if (!assignment) {
        return { ok: false, reason: 'Every Zoom host licence is already booked at this exam time. Move the exam or a class.' };
    }
    await renameZoomHost(assignment.account, assignment.hostEmail, ACADEMY_HOST_DISPLAY_NAME);

    const topic = `EXAM: ${assessment.title}`;
    const zoom = await createZoomMeeting({
        topic,
        agenda: 'Proctored exam room — keep your camera on for the whole exam.',
        startTime: start.toISOString(),
        durationMinutes,
        hostEmail: assignment.hostEmail,
        account: assignment.account,
    });

    const liveClass: any = await LiveClass.create({
        courseId: String(assessment.courseId),
        instructorId: assessment.createdBy,
        topic,
        description: 'Proctored exam room',
        startTime: start,
        durationMinutes,
        zoomMeetingId: String(zoom.id),
        zoomJoinUrl: zoom.join_url,
        zoomStartUrl: zoom.start_url,
        zoomPasscode: zoom.password,
        zoomHostEmail: assignment.hostEmail,
        zoomAccountKey: assignment.account.key,
        status: 'scheduled',
    });

    assessment.proctorLiveClassId = String(liveClass._id);
    if (typeof assessment.save === 'function') await assessment.save();
    return { ok: true, liveClassId: String(liveClass._id), created: true };
}

/** Removes an exam's room (exam deleted, or turned back into a draft/test). */
export async function cancelExamRoom(assessment: any) {
    if (assessment?.proctorLiveClassId) await cancelRoom(String(assessment.proctorLiveClassId));
}
