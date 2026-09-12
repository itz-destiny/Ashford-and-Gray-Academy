import TimetableSession from '@/models/TimetableSession';

// A course can be taught by several lecturers across different modules —
// for display purposes (e.g. "rate your facilitator"), this picks whoever
// teaches the most sessions of that course as its primary facilitator.
export async function getPrimaryFacilitator(courseId: string): Promise<{ uid: string; name: string } | null> {
    const sessions = await TimetableSession.find({ courseId, instructorUid: { $nin: [null, ''] } })
        .select('instructorUid lecturerName')
        .lean<{ instructorUid: string; lecturerName: string }[]>();

    if (sessions.length === 0) return null;

    const counts = new Map<string, { name: string; count: number }>();
    for (const s of sessions) {
        const entry = counts.get(s.instructorUid) || { name: s.lecturerName, count: 0 };
        entry.count += 1;
        counts.set(s.instructorUid, entry);
    }

    let best: { uid: string; name: string; count: number } | null = null;
    for (const [uid, { name, count }] of counts) {
        if (!best || count > best.count) best = { uid, name, count };
    }
    return best ? { uid: best.uid, name: best.name } : null;
}
