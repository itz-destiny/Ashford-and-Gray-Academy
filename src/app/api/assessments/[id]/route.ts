import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import Enrollment from '@/models/Enrollment';
import { AuthError, requireRole, withAuth, type AuthContext } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

const STAFF_ROLES = ['admin', 'instructor', 'course_registrar'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('assessments/[id] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

function isStaff(auth: AuthContext): boolean {
    return (STAFF_ROLES as readonly string[]).includes(auth.role);
}

function canManage(assessment: any, auth: AuthContext): boolean {
    return auth.role === 'admin' || auth.role === 'course_registrar' || assessment.createdBy === auth.uid;
}

function stripAnswerKey(assessment: any) {
    return {
        ...assessment,
        questions: (assessment.questions || []).map((q: any) => ({
            ...q,
            options: q.options ? q.options.map((o: any) => ({ text: o.text })) : undefined,
        })),
    };
}

// =============================================================================
// GET /api/assessments/[id]
//   Staff who created it (or admin/course_registrar): full document, answer
//   key included.
//   Student: answer key stripped, unless they already have a submitted or
//   graded Attempt — in which case the full question set (with correct
//   answers) is returned so they can review what they got right/wrong.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();

        const assessment = await Assessment.findById(id).lean<any>();
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        if (isStaff(auth)) {
            if (!canManage(assessment, auth)) {
                return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });
            }
            return NextResponse.json(assessment);
        }

        // Student eligibility: published, and cohort-wide or enrolled in the target course.
        if (assessment.status !== 'published') {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }
        if (assessment.courseId) {
            const enrolled = await Enrollment.findOne({ userId: auth.uid, courseId: assessment.courseId }).select('_id').lean();
            if (!enrolled) {
                return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
            }
        }

        const myAttempt = await Attempt.findOne({ assessmentId: id, userId: auth.uid })
            .select('_id status score maxScore startedAt')
            .lean<any>();

        if (myAttempt && myAttempt.status !== 'in_progress') {
            return NextResponse.json({ ...assessment, myAttempt });
        }
        return NextResponse.json({ ...stripAnswerKey(assessment), myAttempt: myAttempt || null });
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// PATCH /api/assessments/[id] — creator or admin/course_registrar only.
// Used for both field edits and publishing ({ status: 'published' }).
// =============================================================================
const questionSchema = z.object({
    type: z.enum(['mcq', 'true_false', 'short_answer']),
    text: z.string().min(1).max(2000),
    points: z.number().min(0).max(1000).default(1),
    options: z.array(z.object({ text: z.string().min(1).max(500), isCorrect: z.boolean() })).optional(),
    sampleAnswer: z.string().max(2000).optional(),
    order: z.number().default(0),
});

const patchSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(3000).optional(),
    type: z.enum(['test', 'exam']).optional(),
    courseId: z.string().min(1).nullable().optional(),
    questions: z.array(questionSchema).min(1).optional(),
    durationMinutes: z.number().min(1).max(600).optional(),
    opensAt: z.string().min(1).optional(),
    closesAt: z.string().min(1).optional(),
    status: z.enum(['draft', 'published']).optional(),
});

export const PATCH = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, STAFF_ROLES);
        const { id } = await params;

        const json = await req.json().catch(() => null);
        const parsed = patchSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        await dbConnect();
        const assessment = await Assessment.findById(id);
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }
        if (!canManage(assessment, auth)) {
            return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });
        }

        const data = parsed.data;
        if (data.questions) {
            for (const q of data.questions) {
                if ((q.type === 'mcq' || q.type === 'true_false')) {
                    if (!q.options || q.options.length < 2 || !q.options.some(o => o.isCorrect)) {
                        return NextResponse.json(
                            { error: `Question "${q.text}" needs at least 2 options with one marked correct.` },
                            { status: 400 }
                        );
                    }
                }
            }
            assessment.questions = data.questions as any;
        }
        if (data.title !== undefined) assessment.title = data.title;
        if (data.description !== undefined) assessment.description = data.description;
        if (data.type !== undefined) assessment.type = data.type;
        if (data.courseId !== undefined) assessment.courseId = data.courseId as any;
        if (data.durationMinutes !== undefined) assessment.durationMinutes = data.durationMinutes;
        if (data.opensAt !== undefined) assessment.opensAt = new Date(data.opensAt);
        if (data.closesAt !== undefined) assessment.closesAt = new Date(data.closesAt);
        if (data.status !== undefined) assessment.status = data.status;

        await assessment.save();
        return NextResponse.json(assessment);
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// DELETE /api/assessments/[id] — creator or admin/course_registrar only.
// =============================================================================
export const DELETE = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, STAFF_ROLES);
        const { id } = await params;

        await dbConnect();
        const assessment = await Assessment.findById(id).lean();
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }
        if (!canManage(assessment, auth)) {
            return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });
        }

        await Attempt.deleteMany({ assessmentId: id });
        await Assessment.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Assessment deleted successfully' });
    } catch (err) {
        return handleError(err);
    }
});
