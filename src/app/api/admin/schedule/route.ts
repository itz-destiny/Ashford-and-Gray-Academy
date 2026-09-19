import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { resolveCourses } from '@/lib/resolve-course';
import { watDayBoundsUtc, todayWatDateStr } from '@/lib/wat-time';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admin/schedule route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/admin/schedule?date=YYYY-MM-DD — every class scheduled on that WAT
// calendar day (defaults to today), with its real Zoom join link, meeting
// ID, and passcode — so the IT, Admissions, Registrar, and Live Monitor
// dashboards can show (and let you copy) any day's links in advance, not
// just today's. Admin, admissions_officer, registrar, and live_monitor only.
// =============================================================================
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'admissions_officer', 'registrar', 'live_monitor']);
        await dbConnect();

        const date = req.nextUrl.searchParams.get('date') || todayWatDateStr();
        const { start, end } = watDayBoundsUtc(date);

        const classes = await LiveClass.find({ startTime: { $gte: start, $lt: end } })
            .sort({ startTime: 1 })
            .lean<any[]>();

        const courses = await resolveCourses(classes.map((c) => String(c.courseId)));

        const rows = classes.map((c) => ({
            liveClassId: c._id.toString(),
            topic: c.topic,
            courseTitle: courses.get(String(c.courseId))?.title || 'Whole Cohort',
            startTime: c.startTime,
            durationMinutes: c.durationMinutes,
            status: c.status,
            zoomJoinUrl: c.zoomJoinUrl,
            zoomMeetingId: c.zoomMeetingId,
            zoomPasscode: c.zoomPasscode,
        }));

        return NextResponse.json({ success: true, date, classes: rows });
    } catch (err) {
        return handleError(err);
    }
});
