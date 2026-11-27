import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { getAllLiveClasses } from '@/lib/monitor-slots';
import { resolveCourses } from '@/lib/resolve-course';
import { adminOnlyRoomIds } from '@/lib/exam-access';
import { WARNING_STAFF_ROLES } from '@/lib/class-warnings';
import ClassWarning from '@/models/ClassWarning';

const ORDER: Record<string, number> = { live: 0, upcoming: 1, ended: 2 };

// GET /api/class-warnings/classes — today's classes (WAT), live ones first,
// with how many warnings each has had. Staff only.
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, WARNING_STAFF_ROLES);
        await dbConnect();
        const hidden = auth.role === 'admin' ? new Set<string>() : await adminOnlyRoomIds();
        const list = (await getAllLiveClasses()).filter((c) => !hidden.has(String(c._id)));
        const courses = await resolveCourses(list.map((c) => String(c.courseId)));
        const counts = new Map<string, number>((await ClassWarning.aggregate([
            { $match: { liveClassId: { $in: list.map((c) => String(c._id)) } } },
            { $group: { _id: '$liveClassId', n: { $sum: 1 } } },
        ])).map((r: any) => [r._id, r.n]));
        const now = Date.now();
        const classes = list.map((c) => {
            const start = new Date(c.startTime).getTime();
            const end = start + (c.durationMinutes || 60) * 60_000;
            return {
                liveClassId: String(c._id),
                topic: c.topic,
                courseTitle: courses.get(String(c.courseId))?.title || 'Unknown course',
                startTime: c.startTime,
                durationMinutes: c.durationMinutes,
                state: now < start ? 'upcoming' : now <= end ? 'live' : 'ended',
                joined: ((c as any).attendees || []).length,
                warnings: counts.get(String(c._id)) || 0,
            };
        }).sort((a, b) => ORDER[a.state] - ORDER[b.state] || +new Date(a.startTime) - +new Date(b.startTime));
        return NextResponse.json({ classes });
    } catch (err) {
        if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('class-warnings/classes error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
