import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import ProctorSnapshot from '@/models/ProctorSnapshot';
import { AuthError, withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ snapshotId: string }> };

// =============================================================================
// GET /api/proctor-snapshots/[snapshotId] — the photo itself, only for staff
// who manage the exam it was taken in. Never cached publicly.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { snapshotId } = await params;
        await dbConnect();
        const snap = await ProctorSnapshot.findById(snapshotId).lean<any>();
        if (!snap) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const assessment = await Assessment.findById(snap.assessmentId).select('createdBy').lean<any>();
        const allowed = auth.role === 'admin' || auth.role === 'course_registrar' || assessment?.createdBy === auth.uid;
        if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const bytes = snap.data?.buffer ? Buffer.from(snap.data.buffer) : Buffer.from(snap.data);
        return new NextResponse(new Uint8Array(bytes), {
            headers: {
                'Content-Type': snap.contentType || 'image/jpeg',
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('proctor-snapshots route error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
