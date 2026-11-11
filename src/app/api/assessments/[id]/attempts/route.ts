import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { AuthError, requireRole, withAuth, type AuthContext } from '@/lib/auth-server';
import { isProctored } from '@/lib/proctoring';
import { ensureExamRoom } from '@/lib/exam-room';

type RouteParams = { params: Promise<{ id: string }> };

const STAFF_ROLES = ['admin', 'instructor', 'course_registrar'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('assessments/[id]/attempts route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

function canManage(assessment: any, auth: AuthContext): boolean {
    return auth.role === 'admin' || auth.role === 'course_registrar' || assessment.createdBy === auth.uid;
}

// =============================================================================
// POST /api/assessments/[id]/attempts — a student starts an attempt.
// =============================================================================
export const POST = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();

        const assessment = await Assessment.findById(id).lean<any>();
        if (!assessment || assessment.status !== 'published') {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const now = new Date();
        if (now < new Date(assessment.opensAt)) {
            return NextResponse.json({ error: 'This assessment has not opened yet.' }, { status: 403 });
        }
        if (now > new Date(assessment.closesAt)) {
            return NextResponse.json({ error: 'This assessment has closed.' }, { status: 403 });
        }

        if (assessment.courseId) {
            const enrolled = await Enrollment.findOne({ userId: auth.uid, courseId: assessment.courseId }).select('_id').lean();
            if (!enrolled) {
                return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
            }
        }

        const existing = await Attempt.findOne({ assessmentId: id, userId: auth.uid }).lean();
        if (existing) {
            return NextResponse.json({ error: 'You have already attempted this assessment.' }, { status: 409 });
        }

        // Fallback: an exam published before its room could be made gets one now.
        if (isProctored(assessment) && !assessment.proctorLiveClassId) {
            const doc = await Assessment.findById(id);
            const room = doc ? await ensureExamRoom(doc).catch((e: any) => ({ ok: false, reason: e?.message })) : null;
            if (room && !room.ok) console.warn('exam room unavailable at attempt start:', (room as any).reason);
        }

        const attempt = await Attempt.create({
            assessmentId: id,
            userId: auth.uid,
            answers: [],
            maxScore: assessment.totalPoints,
            status: 'in_progress',
            startedAt: now,
            ...(isProctored(assessment) ? { proctoring: { violations: [], events: [], snapshotCount: 0, lastSeenAt: now, autoSubmitted: false } } : {}),
        });

        return NextResponse.json(attempt, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// GET /api/assessments/[id]/attempts — creator/admin only: every attempt on
// this assessment, joined with student name/email, for the results view.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, STAFF_ROLES);
        const { id } = await params;

        await dbConnect();
        const assessment = await Assessment.findById(id).lean<any>();
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }
        if (!canManage(assessment, auth)) {
            return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });
        }

        const attempts = await Attempt.find({ assessmentId: id }).sort({ createdAt: -1 }).lean<any[]>();
        const result = [];
        for (const a of attempts) {
            const student = await User.findOne({ uid: a.userId }).select('displayName email').lean<any>();
            result.push({ ...a, student: student ? { displayName: student.displayName, email: student.email } : null });
        }

        return NextResponse.json(result);
    } catch (err) {
        return handleError(err);
    }
});
