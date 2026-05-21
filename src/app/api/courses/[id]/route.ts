import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import { AuthError, requireRole, withAuth, type AuthContext } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Ownership: prefer instructorUid (set on new courses); fall back to
 * display-name compare for legacy rows. Admins/course_registrars bypass.
 */
async function assertCanEditCourse(courseId: string, auth: AuthContext) {
    if (auth.role === 'admin' || auth.role === 'course_registrar') return;
    if (auth.role !== 'instructor') {
        throw new AuthError(403, 'Only instructors or admins can edit a course.');
    }
    const course = await Course.findById(courseId).select('instructorUid instructor');
    if (!course) throw new AuthError(404, 'Course not found');
    const ownsByUid = course.instructorUid && course.instructorUid === auth.uid;
    const ownsByName = !course.instructorUid && course.instructor?.name === auth.displayName;
    if (!ownsByUid && !ownsByName) {
        throw new AuthError(403, 'You can only edit your own courses.');
    }
}

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('courses/[id] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export const PATCH = withAuth<RouteParams>(async (request: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();
        await assertCanEditCourse(id, auth);

        const body = await request.json();
        // Non-admins cannot flip status to published.
        if (auth.role !== 'admin' && body.status === 'published') {
            delete body.status;
        }

        const course = await Course.findByIdAndUpdate(id, body, { new: true });
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        return NextResponse.json(course);
    } catch (err) {
        return handleError(err);
    }
});

export const DELETE = withAuth<RouteParams>(async (_request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ['admin', 'course_registrar']);
        const { id } = await params;
        await dbConnect();
        const course = await Course.findByIdAndDelete(id);
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (err) {
        return handleError(err);
    }
});
