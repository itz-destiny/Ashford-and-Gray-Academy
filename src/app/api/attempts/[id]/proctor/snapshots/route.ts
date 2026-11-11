import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import ProctorSnapshot from '@/models/ProctorSnapshot';
import { AuthError, withAuth, type AuthContext } from '@/lib/auth-server';
import { MAX_SNAPSHOT_BYTES, isProctored } from '@/lib/proctoring';

type RouteParams = { params: Promise<{ id: string }> };

const REASONS = ['start', 'interval', 'violation'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('attempts/[id]/proctor/snapshots route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

function canManage(assessment: any, auth: AuthContext): boolean {
    return auth.role === 'admin' || auth.role === 'course_registrar' || assessment.createdBy === auth.uid;
}

// =============================================================================
// POST /api/attempts/[id]/proctor/snapshots — the student's exam page uploads
// a webcam photo (multipart: `image` JPEG, `reason`, optional `detail`).
// =============================================================================
export const POST = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        const form = await req.formData().catch(() => null);
        const image = form?.get('image');
        const reason = String(form?.get('reason') || 'interval');
        const detail = form?.get('detail') ? String(form.get('detail')).slice(0, 200) : undefined;

        if (!(image instanceof Blob) || image.type !== 'image/jpeg') {
            return NextResponse.json({ error: 'A JPEG image is required.' }, { status: 400 });
        }
        if (image.size > MAX_SNAPSHOT_BYTES) {
            return NextResponse.json({ error: 'Image too large.' }, { status: 413 });
        }
        if (!(REASONS as readonly string[]).includes(reason)) {
            return NextResponse.json({ error: 'Invalid reason.' }, { status: 400 });
        }

        await dbConnect();
        const attempt = await Attempt.findById(id).select('userId assessmentId status').lean<any>();
        if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        if (attempt.userId !== auth.uid) return NextResponse.json({ error: 'Not your attempt.' }, { status: 403 });
        if (attempt.status !== 'in_progress') return NextResponse.json({ error: 'This exam has been submitted.' }, { status: 409 });

        const assessment = await Assessment.findById(attempt.assessmentId).select('type').lean<any>();
        if (!isProctored(assessment)) {
            return NextResponse.json({ error: 'This assessment is not proctored.' }, { status: 400 });
        }

        const now = new Date();
        await ProctorSnapshot.create({
            attemptId: attempt._id,
            assessmentId: attempt.assessmentId,
            userId: auth.uid,
            reason,
            detail,
            contentType: 'image/jpeg',
            data: Buffer.from(await image.arrayBuffer()),
            takenAt: now,
        });
        await Attempt.updateOne(
            { _id: id },
            {
                $inc: { 'proctoring.snapshotCount': 1 },
                $set: { 'proctoring.lastSnapshotAt': now, 'proctoring.lastSeenAt': now, 'proctoring.cameraOk': true },
            },
        );
        return NextResponse.json({ saved: true }, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// GET /api/attempts/[id]/proctor/snapshots — staff who manage the exam: the
// list of photos for this attempt (metadata only; images load from
// /api/proctor-snapshots/[snapshotId]).
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();
        const attempt = await Attempt.findById(id).select('assessmentId').lean<any>();
        if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        const assessment = await Assessment.findById(attempt.assessmentId).select('createdBy').lean<any>();
        if (!assessment || !canManage(assessment, auth)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const snapshots = await ProctorSnapshot.find({ attemptId: id })
            .select('_id reason detail takenAt')
            .sort({ takenAt: 1 })
            .lean<any[]>();
        return NextResponse.json(snapshots.map(s => ({ _id: String(s._id), reason: s.reason, detail: s.detail, takenAt: s.takenAt })));
    } catch (err) {
        return handleError(err);
    }
});
