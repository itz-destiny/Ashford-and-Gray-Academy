import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { resolveCourse } from '@/lib/resolve-course';
import { WARNING_STAFF_ROLES } from '@/lib/class-warnings';
import LiveClass from '@/models/LiveClass';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import ClassWarning from '@/models/ClassWarning';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/class-warnings/classes/[id] — the class roster (students enrolled in
// the course, plus anyone who joined it), who has joined, and every warning
// given in this class. Staff only.
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { params, auth }) => {
    try {
        requireRole(auth, WARNING_STAFF_ROLES);
        await dbConnect();
        const { id } = await params;
        const lc: any = await LiveClass.findById(id).lean().catch(() => null);
        if (!lc) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        const course = await resolveCourse(String(lc.courseId));

        const enrolled = (await Enrollment.find({ courseId: lc.courseId }).select('userId').lean<{ userId: string }[]>()).map((e) => e.userId);
        const joinedAt = new Map<string, Date>();
        for (const a of lc.attendees || []) if (a.userId && !joinedAt.has(a.userId)) joinedAt.set(a.userId, a.joinedAt);
        const uids = [...new Set([...enrolled, ...joinedAt.keys()])];
        const users = await User.find({ uid: { $in: uids }, role: 'student' }).select('uid displayName email').lean<{ uid: string; displayName?: string; email?: string }[]>();

        const warnings = await ClassWarning.find({ liveClassId: id }).sort({ createdAt: -1 }).lean();
        const totals = new Map<string, number>((await ClassWarning.aggregate([
            { $match: { studentUid: { $in: users.map((u) => u.uid) } } },
            { $group: { _id: '$studentUid', n: { $sum: 1 } } },
        ])).map((r: any) => [r._id, r.n]));

        const students = users.map((u) => ({
            uid: u.uid,
            name: u.displayName || u.email || 'Student',
            email: u.email || '',
            joinedAt: joinedAt.get(u.uid) || null,
            warningsHere: warnings.filter((w) => w.studentUid === u.uid).length,
            warningsTotal: totals.get(u.uid) || 0,
        })).sort((a, b) => Number(!!b.joinedAt) - Number(!!a.joinedAt) || a.name.localeCompare(b.name));

        return NextResponse.json({
            class: { liveClassId: id, topic: lc.topic, courseTitle: course?.title || 'Unknown course', startTime: lc.startTime, durationMinutes: lc.durationMinutes },
            students,
            warnings: warnings.map((w) => ({
                _id: String(w._id), studentUid: w.studentUid, studentName: w.studentName, reason: w.reason, note: w.note,
                issuedByName: w.issuedByName, createdAt: w.createdAt, acknowledgedAt: w.acknowledgedAt,
            })),
        });
    } catch (err) {
        if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('class-warnings/classes/[id] error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
