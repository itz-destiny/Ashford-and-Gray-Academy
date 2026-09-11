import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Resource } from '@/models/Supports';
import { withAuth, requireRole, AuthError } from '@/lib/auth-server';
import { getInstructorCourseIds } from '@/lib/instructor-courses';

type RouteParams = { params: Promise<{ id: string }> };

export const DELETE = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ['admin', 'instructor', 'course_registrar']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        const { id } = await params;
        await dbConnect();

        const resource = await Resource.findById(id);
        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // An instructor may only delete a resource they created, or one
        // attached to a course they teach — never anyone else's material.
        if (auth.role === 'instructor') {
            const isOwner = resource.createdBy === auth.uid;
            let ownsCourse = false;
            if (!isOwner && resource.courseId) {
                const myCourseIds = await getInstructorCourseIds(auth.uid);
                ownsCourse = myCourseIds.includes(String(resource.courseId));
            }
            if (!isOwner && !ownsCourse) {
                return NextResponse.json({ error: 'You can only delete resources you shared with your own cohort.' }, { status: 403 });
            }
        }

        await Resource.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('DELETE /api/resources/[id] failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
