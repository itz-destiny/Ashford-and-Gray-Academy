import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recording from '@/models/Recording';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { withAuth, type AuthContext } from '@/lib/auth-server';
import { adminStorage } from '@/lib/firebase-admin';

type RouteParams = { params: Promise<{ id: string }> };

async function canPlay(courseId: string | undefined, auth: AuthContext): Promise<boolean> {
    if (!courseId) return auth.role === 'admin';
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
 * GET /api/recordings/{id}/playback
 * Returns a fresh signed URL (1h) for the recording's file. Re-fetch whenever
 * the URL is about to expire — never store this URL anywhere persistent.
 */
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();
        const recording = await Recording.findById(id);
        if (!recording) {
            return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
        }
        if (recording.status !== 'complete' || !recording.storagePath) {
            return NextResponse.json({ error: 'Recording is not ready for playback yet.' }, { status: 409 });
        }

        const allowed = await canPlay(
            recording.courseId ? String(recording.courseId) : undefined,
            auth
        );
        if (!allowed) {
            return NextResponse.json({ error: 'Not authorized to view this recording' }, { status: 403 });
        }

        const bucket = adminStorage().bucket();
        const expiresAt = Date.now() + 60 * 60 * 1000;
        const [url] = await bucket.file(recording.storagePath).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: expiresAt,
        });

        return NextResponse.json({
            url,
            expiresAt: new Date(expiresAt).toISOString(),
            durationSec: recording.durationSec,
            fileSize: recording.fileSize,
        });
    } catch (err) {
        console.error('recording playback failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
