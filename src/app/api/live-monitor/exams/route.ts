import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import Attempt from '@/models/Attempt';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { watDayBoundsUtc } from '@/lib/wat-time';

// =============================================================================
// GET /api/live-monitor/exams — today's proctored exams (and any still open)
// for monitor accounts to watch on Live Proctoring. "Admin only" exams are
// listed for the admin only.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['live_monitor', 'admin']);
        await dbConnect();
        const { start, end } = watDayBoundsUtc();
        const now = new Date();

        const exams = await Assessment.find({
            type: 'exam',
            status: 'published',
            ...(auth.role === 'admin' ? {} : { adminOnly: { $ne: true } }),
            $or: [
                { opensAt: { $gte: start, $lt: end } },
                { opensAt: { $lte: now }, closesAt: { $gte: new Date(now.getTime() - 3 * 3600_000) } },
            ],
        }).select('title slug courseId opensAt closesAt durationMinutes adminOnly proctorLiveClassId').sort({ opensAt: 1 }).lean<any[]>();

        const courses = await Course.find({ _id: { $in: exams.map(e => e.courseId).filter(Boolean) } }).select('title').lean<any[]>();
        const courseTitle = new Map(courses.map(c => [String(c._id), c.title]));
        const counts = await Attempt.aggregate([
            { $match: { assessmentId: { $in: exams.map(e => e._id) } } },
            { $group: { _id: { a: '$assessmentId', s: '$status' }, n: { $sum: 1 } } },
        ]);
        const count = (id: unknown, s: string) => counts.find(c => String(c._id.a) === String(id) && c._id.s === s)?.n || 0;

        return NextResponse.json({
            exams: exams.map(e => ({
                id: String(e._id),
                slug: e.slug || String(e._id),
                title: e.title,
                courseTitle: courseTitle.get(String(e.courseId)) || '',
                opensAt: e.opensAt,
                closesAt: e.closesAt,
                durationMinutes: e.durationMinutes,
                adminOnly: !!e.adminOnly,
                roomId: e.proctorLiveClassId || null,
                writing: count(e._id, 'in_progress'),
                submitted: count(e._id, 'submitted') + count(e._id, 'graded'),
            })),
        });
    } catch (err) {
        if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('live-monitor/exams route error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
