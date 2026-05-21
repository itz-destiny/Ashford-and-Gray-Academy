import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recording from '@/models/Recording';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { withAuth, type AuthContext } from '@/lib/auth-server';

async function canSeeCourse(courseId: string, auth: AuthContext): Promise<boolean> {
    if (auth.role === 'admin' || auth.role === 'course_registrar' || auth.role === 'registrar') return true;
    if (auth.role === 'instructor') {
        const course = await Course.findById(courseId).select('instructorUid instructor');
        if (!course) return false;
        return (course.instructorUid && course.instructorUid === auth.uid) ||
               (!course.instructorUid && course.instructor?.name === auth.displayName);
    }
    const en = await Enrollment.findOne({ courseId, userId: auth.uid }).select('_id');
    return !!en;
}

/**
 * GET /api/recordings?courseId=<id>
 * Returns recordings belonging to the course, if the caller is allowed to see
 * them (instructor/owner, admin, registrar, course_registrar, or enrolled
 * student). Each row gets a playback URL via a separate endpoint.
 */
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) {
        return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    try {
        await dbConnect();
        const allowed = await canSeeCourse(courseId, auth);
        if (!allowed) {
            return NextResponse.json({ error: 'Not authorized for this course' }, { status: 403 });
        }

        const recordings = await Recording.find({ courseId })
            .sort({ startedAt: -1 })
            .lean();

        return NextResponse.json({
            recordings: recordings.map((r: any) => ({
                _id: String(r._id),
                egressId: r.egressId,
                roomName: r.roomName,
                status: r.status,
                startedAt: r.startedAt,
                endedAt: r.endedAt,
                durationSec: r.durationSec,
                fileSize: r.fileSize,
                hasFile: !!r.storagePath,
                error: r.error,
            })),
        });
    } catch (err) {
        console.error('GET /api/recordings failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
