import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { getAllLiveClasses } from '@/lib/monitor-slots';
import { resolveCourses } from '@/lib/resolve-course';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('live-monitor/current route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/live-monitor/current — for the signed-in monitor account: every
// class that's live right now, across every Zoom account/host. Any monitor
// account can pick whichever one it wants to watch — none are bound to a
// fixed capacity slot.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['live_monitor']);
        await dbConnect();

        const liveClasses = await getAllLiveClasses();
        const courses = await resolveCourses(liveClasses.map((c) => String(c.courseId)));

        return NextResponse.json({
            classes: liveClasses.map((c) => ({
                liveClassId: c._id.toString(),
                topic: c.topic,
                courseTitle: courses.get(String(c.courseId))?.title || 'Unknown course',
                startTime: c.startTime,
                durationMinutes: c.durationMinutes,
                zoomJoinUrl: c.zoomJoinUrl,
                zoomMeetingId: c.zoomMeetingId,
                zoomPasscode: c.zoomPasscode,
            })),
        });
    } catch (err) {
        return handleError(err);
    }
});
