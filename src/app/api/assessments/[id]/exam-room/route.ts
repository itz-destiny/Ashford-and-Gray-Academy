import { NextResponse, type NextRequest } from 'next/server';
import { resolveAssessmentId } from '@/lib/assessment-slug';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { ensureExamRoom } from '@/lib/exam-room';

type RouteParams = { params: Promise<{ id: string }> };

// =============================================================================
// POST /api/assessments/[id]/exam-room — staff who manage a published exam:
// create its live Zoom exam room now if it doesn't have one (e.g. every Zoom
// licence was busy when it was published).
// =============================================================================
export const POST = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ['admin', 'instructor', 'course_registrar']);
        const id = await resolveAssessmentId((await params).id);
        await dbConnect();
        const assessment = await Assessment.findById(id);
        if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        const allowed = auth.role === 'admin' || auth.role === 'course_registrar' || assessment.createdBy === auth.uid;
        if (!allowed) return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });
        if (assessment.status !== 'published') {
            return NextResponse.json({ error: 'Publish the exam first.' }, { status: 400 });
        }
        const room = await ensureExamRoom(assessment);
        if (!room.ok) return NextResponse.json({ error: room.reason }, { status: 409 });
        return NextResponse.json({ success: true, liveClassId: room.liveClassId, created: room.created });
    } catch (err: any) {
        if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('assessments/[id]/exam-room route error:', err);
        return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
    }
});
