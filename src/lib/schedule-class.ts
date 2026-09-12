import TimetableSession, { type ITimetableSession } from '@/models/TimetableSession';
import LiveClass from '@/models/LiveClass';
import User from '@/models/User';
import { createZoomMeeting, renameZoomHost, enableZoomVirtualBackground, setZoomHostPicture, ACADEMY_HOST_DISPLAY_NAME } from './zoom';
import { findAvailableZoomHost } from './zoom-scheduler';

export type ScheduleClassResult =
    | { ok: true; alreadyScheduled: boolean; liveClass: any; session: ITimetableSession }
    | { ok: false; reason: string };

// Creates the real Zoom meeting + LiveClass record for one timetable
// session, and marks the session as scheduled. Shared by the interactive
// "Create Zoom Class" action (schedule-zoom route) and the daily
// auto-schedule cron — both need the exact same behavior, including the
// same skip conditions for incomplete/duplicate rows.
export async function scheduleClassForSession(session: ITimetableSession): Promise<ScheduleClassResult> {
    if (session.status === 'scheduled' && session.liveClassId) {
        const existing = await LiveClass.findById(session.liveClassId);
        if (existing) {
            return { ok: true, alreadyScheduled: true, liveClass: existing, session };
        }
    }

    if (!session.courseId) {
        return { ok: false, reason: 'Not linked to a course yet' };
    }
    if (!session.instructorUid) {
        return { ok: false, reason: 'No lecturer assigned yet' };
    }

    const durationMinutes = Math.max(15, Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000));
    const topic = `${session.courseTitle || session.programmeName}: ${session.module}`;

    const assignment = await findAvailableZoomHost(session.startTime, durationMinutes);
    if (!assignment) {
        return { ok: false, reason: 'Every licensed Zoom host is already booked for this time slot' };
    }

    await renameZoomHost(assignment.account, assignment.hostEmail, ACADEMY_HOST_DISPLAY_NAME);
    await enableZoomVirtualBackground(assignment.account, assignment.hostEmail);
    await setZoomHostPicture(assignment.account, assignment.hostEmail);

    const instructor = await User.findOne({ uid: session.instructorUid }).select('zoomPersonalEmail').lean<{ zoomPersonalEmail?: string } | null>();

    const zoomResponse = await createZoomMeeting({
        topic,
        agenda: session.programmeName,
        startTime: session.startTime.toISOString(),
        durationMinutes,
        hostEmail: assignment.hostEmail,
        account: assignment.account,
        alternativeHostEmail: instructor?.zoomPersonalEmail,
    });

    const liveClass = await LiveClass.create({
        courseId: session.courseId,
        instructorId: session.instructorUid,
        topic,
        description: session.module,
        startTime: session.startTime,
        durationMinutes,
        zoomMeetingId: zoomResponse.id.toString(),
        zoomJoinUrl: zoomResponse.join_url,
        zoomStartUrl: zoomResponse.start_url,
        zoomPasscode: zoomResponse.password,
        zoomHostEmail: assignment.hostEmail,
        zoomAccountKey: assignment.account.key,
        status: 'scheduled',
    });

    session.status = 'scheduled';
    session.liveClassId = liveClass._id.toString();
    session.zoomJoinUrl = zoomResponse.join_url;
    session.zoomStartUrl = zoomResponse.start_url;
    await session.save();

    return { ok: true, alreadyScheduled: false, liveClass, session };
}

// Every "real" (non-blank-duplicate) session in the timetable window that
// hasn't been scheduled on Zoom yet — used by the auto-schedule cron to
// find tomorrow's work.
export async function findUnscheduledSessions(startUtc: Date, endUtc: Date): Promise<ITimetableSession[]> {
    return TimetableSession.find({
        startTime: { $gte: startUtc, $lt: endUtc },
        status: { $ne: 'scheduled' },
        courseId: { $nin: [null, ''] },
        instructorUid: { $nin: [null, ''] },
        module: { $nin: [null, ''] },
    });
}
