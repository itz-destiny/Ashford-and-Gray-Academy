import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import TimetableSession from '@/models/TimetableSession';
import { AuthError, withAuth, type AuthContext } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

const ELEVATED = ['admin', 'course_registrar', 'registrar'];

async function isEnrolled(courseId: string, uid: string): Promise<boolean> {
    const en = await Enrollment.findOne({ courseId, userId: uid }).select('_id');
    return !!en;
}

async function isCourseOwner(courseId: string, auth: AuthContext): Promise<boolean> {
    if (auth.role !== 'instructor') return false;
    const course = await Course.findById(courseId).select('instructorUid instructor');
    if (!course) return false;
    if (course.instructorUid) return course.instructorUid === auth.uid;
    return course.instructor?.name === auth.displayName;
}

export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id: courseId } = await params;
        await dbConnect();

        if (!ELEVATED.includes(auth.role) && !(await isCourseOwner(courseId, auth)) && !(await isEnrolled(courseId, auth.uid))) {
            throw new AuthError(403, 'You must enroll in this course to view its class schedule.');
        }

        const sessions = await TimetableSession.find({ courseId })
            .select('-instructorEmail')
            .sort({ startTime: 1 });
        return NextResponse.json({ success: true, sessions });
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('courses/[id]/timetable route error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
