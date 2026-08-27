import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';
import { withAuth } from '@/lib/auth-server';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// =============================================================================
// GET /api/student/instructors — the instructors of every course the calling
// student is actively enrolled in (access ends once the course's stated
// duration has elapsed from the enrollment date, same rule messaging already
// enforces). Exists because GET /api/users?role=instructor requires an
// elevated role — a student calling it always got a 403, which silently
// emptied the Communications "Instructors" directory for every student.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();

        const enrollments = await Enrollment.find({ userId: auth.uid }).select('courseId enrolledAt').lean();
        if (enrollments.length === 0) {
            return NextResponse.json({ success: true, instructors: [] });
        }

        const courseIds = enrollments.map((e: any) => e.courseId).filter(Boolean);
        const courses = await Course.find({ _id: { $in: courseIds } }).select('_id instructorUid duration').lean();
        const courseById = new Map(courses.map((c: any) => [String(c._id), c]));

        const now = Date.now();
        const activeInstructorUids = new Set<string>();
        for (const en of enrollments) {
            const course = courseById.get(String(en.courseId));
            if (!course?.instructorUid) continue;
            const enrolledAt = new Date(en.enrolledAt).getTime();
            const expiresAt = enrolledAt + (course.duration || 0) * WEEK_MS;
            if (now <= expiresAt) activeInstructorUids.add(course.instructorUid);
        }

        if (activeInstructorUids.size === 0) {
            return NextResponse.json({ success: true, instructors: [] });
        }

        const instructors = await User.find({ uid: { $in: Array.from(activeInstructorUids) } })
            .select('uid displayName photoURL role')
            .lean();

        return NextResponse.json({ success: true, instructors });
    } catch (error: any) {
        console.error('GET /api/student/instructors failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
