import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { resolveCourses } from '@/lib/resolve-course';
import { watDayBoundsUtc, todayWatDateStr } from '@/lib/wat-time';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('registrar/attendance route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/registrar/attendance?date=YYYY-MM-DD — every class scheduled on
// that WAT calendar day (defaults to today), with who actually signed
// attendance for each. Registrar/admin only.
// =============================================================================
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['registrar', 'admin']);
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date') || todayWatDateStr();
        const { start, end } = watDayBoundsUtc(date);

        const classes = await LiveClass.find({ startTime: { $gte: start, $lt: end } })
            .sort({ startTime: 1 })
            .lean<any[]>();

        const courses = await resolveCourses(classes.map((c) => String(c.courseId)));

        const instructorUids = [...new Set(classes.map((c) => c.instructorId).filter(Boolean))];
        const attendeeUids = [...new Set(classes.flatMap((c) => (c.attendees || []).map((a: any) => a.userId)).filter(Boolean))];
        const allUids = [...new Set([...instructorUids, ...attendeeUids])];
        const users = allUids.length
            ? await User.find({ uid: { $in: allUids } }).select('uid displayName email').lean<{ uid: string; displayName: string; email: string }[]>()
            : [];
        const userByUid = new Map(users.map((u) => [u.uid, u]));

        const enrollCounts = new Map<string, number>();
        const courseIds = [...new Set(classes.map((c) => String(c.courseId)).filter(Boolean))];
        for (const cid of courseIds) {
            enrollCounts.set(cid, await Enrollment.countDocuments({ courseId: cid }));
        }

        const result = classes.map((c) => {
            const course = courses.get(String(c.courseId));
            const instructor = userByUid.get(c.instructorId);
            const attendees = (c.attendees || []).map((a: any) => {
                const u = userByUid.get(a.userId);
                return { name: u?.displayName || a.email || 'Unknown', email: a.email || u?.email, role: a.role, joinedAt: a.joinedAt };
            });
            return {
                liveClassId: c._id.toString(),
                topic: c.topic,
                courseTitle: course?.title || 'Whole Cohort',
                instructorName: instructor?.displayName || 'Unassigned',
                startTime: c.startTime,
                durationMinutes: c.durationMinutes,
                status: c.status,
                enrolledCount: enrollCounts.get(String(c.courseId)) || 0,
                attendeeCount: attendees.length,
                attendees,
            };
        });

        return NextResponse.json({ success: true, date, classes: result });
    } catch (err) {
        return handleError(err);
    }
});
