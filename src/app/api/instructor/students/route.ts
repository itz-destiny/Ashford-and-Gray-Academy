import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { withAuth, requireRole } from '@/lib/auth-server';

// =============================================================================
// GET /api/instructor/students — every real student enrolled in a course the
// calling instructor actually teaches (matched by Course.instructorUid, not
// by display-name string matching). This is the instructor's real cohort —
// the same set messaging and resource-sharing are scoped to.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['instructor', 'admin']);
        await dbConnect();

        const courses = await Course.find({ instructorUid: auth.uid }).select('_id title').lean();
        if (courses.length === 0) {
            return NextResponse.json({ success: true, students: [] });
        }
        const courseIds = courses.map((c: any) => c._id.toString());
        const courseTitleById = new Map(courses.map((c: any) => [c._id.toString(), c.title]));

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).lean();
        const uids = Array.from(new Set(enrollments.map((e: any) => e.userId)));
        const users = uids.length
            ? await User.find({ uid: { $in: uids } }).select('uid displayName email photoURL').lean()
            : [];
        const userByUid = new Map(users.map((u: any) => [u.uid, u]));

        // One row per enrollment (a student taking two of your courses shows
        // twice, each with its own course + progress) — callers that only
        // need a unique contact list (messaging) can dedupe by uid themselves.
        const students = [] as any[];
        for (const en of enrollments) {
            const u = userByUid.get(en.userId);
            if (!u) continue;
            students.push({
                uid: u.uid,
                displayName: u.displayName,
                email: u.email,
                photoURL: u.photoURL,
                courseId: String(en.courseId),
                courseTitle: courseTitleById.get(String(en.courseId)) || null,
                progress: en.progress ?? 0,
                enrolledAt: en.enrolledAt,
            });
        }

        return NextResponse.json({ success: true, students, courses: courses.map((c: any) => ({ _id: c._id, title: c.title })) });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error.status || 500 });
    }
});
