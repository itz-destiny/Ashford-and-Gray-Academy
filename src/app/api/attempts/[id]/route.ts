import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import { AuthError, requireRole, withAuth, type AuthContext } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

const STAFF_ROLES = ['admin', 'instructor', 'course_registrar'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('attempts/[id] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

function isStaff(auth: AuthContext): boolean {
    return (STAFF_ROLES as readonly string[]).includes(auth.role);
}

// =============================================================================
// GET /api/attempts/[id] — the attempt's own student, or the assessment's
// creator/admin/course_registrar.
// =============================================================================
export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();

        const attempt = await Attempt.findById(id).lean<any>();
        if (!attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if (attempt.userId !== auth.uid) {
            if (!isStaff(auth)) {
                return NextResponse.json({ error: 'Not your attempt.' }, { status: 403 });
            }
            const assessment = await Assessment.findById(attempt.assessmentId).select('createdBy').lean<any>();
            const canManage = auth.role === 'admin' || auth.role === 'course_registrar' || assessment?.createdBy === auth.uid;
            if (!canManage) {
                return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });
            }
        }

        return NextResponse.json(attempt);
    } catch (err) {
        return handleError(err);
    }
});

const submitSchema = z.object({
    action: z.literal('submit'),
    answers: z.array(z.object({
        questionId: z.string().min(1),
        selectedOptionIndex: z.number().optional(),
        textAnswer: z.string().max(5000).optional(),
    })),
});

const gradeSchema = z.object({
    action: z.literal('grade'),
    grades: z.array(z.object({
        questionId: z.string().min(1),
        pointsAwarded: z.number().min(0),
    })),
});

// =============================================================================
// PATCH /api/attempts/[id]
//   action: 'submit' — the owning student submits answers; MCQ/true-false are
//     auto-graded against the assessment's answer key immediately.
//   action: 'grade'  — the assessment's creator/admin manually scores the
//     pending short-answer questions.
// =============================================================================
export const PATCH = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        const { id } = await params;
        const json = await req.json().catch(() => null);

        await dbConnect();
        const attempt = await Attempt.findById(id);
        if (!attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }
        const assessment = await Assessment.findById(attempt.assessmentId).lean<any>();
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const actionGuess = (json as any)?.action;

        if (actionGuess === 'submit') {
            if (attempt.userId !== auth.uid) {
                return NextResponse.json({ error: 'Not your attempt.' }, { status: 403 });
            }
            if (attempt.status !== 'in_progress') {
                return NextResponse.json({ error: 'This attempt has already been submitted.' }, { status: 409 });
            }
            const parsed = submitSchema.safeParse(json);
            if (!parsed.success) {
                return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
            }

            const questionMap = new Map((assessment.questions || []).map((q: any) => [String(q._id), q]));
            let score = 0;
            const answers = parsed.data.answers.map(a => {
                const q: any = questionMap.get(a.questionId);
                if (!q) return { ...a, pointsAwarded: null, isCorrect: null };

                if (q.type === 'mcq' || q.type === 'true_false') {
                    const correctIndex = (q.options || []).findIndex((o: any) => o.isCorrect);
                    const isCorrect = a.selectedOptionIndex === correctIndex;
                    const pointsAwarded = isCorrect ? q.points : 0;
                    score += pointsAwarded;
                    return { ...a, pointsAwarded, isCorrect };
                }
                // short_answer — pending manual grading.
                return { ...a, pointsAwarded: null, isCorrect: null };
            });

            attempt.answers = answers as any;
            attempt.score = score;
            attempt.maxScore = assessment.totalPoints;
            attempt.status = 'submitted';
            attempt.submittedAt = new Date();
            await attempt.save();
            return NextResponse.json(attempt);
        }

        if (actionGuess === 'grade') {
            requireRole(auth, STAFF_ROLES);
            const canManage = auth.role === 'admin' || auth.role === 'course_registrar' || assessment.createdBy === auth.uid;
            if (!canManage) {
                return NextResponse.json({ error: 'You did not create this assessment.' }, { status: 403 });
            }
            if (attempt.status === 'in_progress') {
                return NextResponse.json({ error: 'This student has not submitted yet.' }, { status: 409 });
            }
            const parsed = gradeSchema.safeParse(json);
            if (!parsed.success) {
                return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
            }

            const gradeMap = new Map(parsed.data.grades.map(g => [g.questionId, g.pointsAwarded]));
            const updatedAnswers = (attempt.answers as any[]).map((a: any) => {
                const plain = {
                    questionId: a.questionId,
                    selectedOptionIndex: a.selectedOptionIndex,
                    textAnswer: a.textAnswer,
                    pointsAwarded: a.pointsAwarded,
                    isCorrect: a.isCorrect,
                };
                if (gradeMap.has(String(a.questionId))) {
                    const pointsAwarded = gradeMap.get(String(a.questionId))!;
                    return { ...plain, pointsAwarded, isCorrect: pointsAwarded > 0 };
                }
                return plain;
            });
            attempt.answers = updatedAnswers as any;

            attempt.score = updatedAnswers.reduce((sum: number, a: any) => sum + (a.pointsAwarded || 0), 0);
            const fullyGraded = updatedAnswers.every((a: any) => a.pointsAwarded !== null);
            if (fullyGraded) {
                attempt.status = 'graded';
                attempt.gradedAt = new Date();
            }
            await attempt.save();
            return NextResponse.json(attempt);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        return handleError(err);
    }
});
