import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Enrollment from '@/models/Enrollment';
import { AuthError, requireRole, withAuth, type AuthContext } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limit';

const STAFF_ROLES = ['admin', 'instructor', 'course_registrar'] as const;

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('assessments route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

function isStaff(auth: AuthContext): boolean {
    return (STAFF_ROLES as readonly string[]).includes(auth.role);
}

// Never let a student-facing list response carry the answer key.
function stripAnswers(assessment: any) {
    return {
        ...assessment,
        questions: (assessment.questions || []).map((q: any) => ({
            ...q,
            options: q.options ? q.options.map((o: any) => ({ text: o.text })) : undefined,
        })),
    };
}

// =============================================================================
// GET /api/assessments
//   Staff (admin/instructor/course_registrar): their own created tests (admin
//   and course_registrar see everything).
//   Student: only published tests they're eligible for — cohort-wide
//   (courseId: null) or in a course they're enrolled in.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();

        if (isStaff(auth)) {
            const query: Record<string, unknown> = {};
            if (auth.role === 'instructor') query.createdBy = auth.uid;
            const assessments = await Assessment.find(query).sort({ createdAt: -1 }).lean();
            return NextResponse.json(assessments);
        }

        const enrollments = await Enrollment.find({ userId: auth.uid }).select('courseId').lean();
        const courseIds = enrollments.map(e => e.courseId).filter(Boolean);

        const assessments = await Assessment.find({
            status: 'published',
            $or: [{ courseId: null }, { courseId: { $in: courseIds } }],
        }).sort({ opensAt: -1 }).lean();

        return NextResponse.json(assessments.map(stripAnswers));
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// POST /api/assessments — create a draft test/exam.
// =============================================================================
const questionSchema = z.object({
    type: z.enum(['mcq', 'true_false', 'short_answer']),
    text: z.string().min(1).max(2000),
    points: z.number().min(0).max(1000).default(1),
    options: z.array(z.object({ text: z.string().min(1).max(500), isCorrect: z.boolean() })).optional(),
    sampleAnswer: z.string().max(2000).optional(),
    order: z.number().default(0),
});

const createSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(3000).optional(),
    type: z.enum(['test', 'exam']).default('test'),
    courseId: z.string().min(1).nullable(),
    questions: z.array(questionSchema).min(1),
    durationMinutes: z.number().min(1).max(600),
    opensAt: z.string().min(1),
    closesAt: z.string().min(1),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['instructor', 'admin', 'course_registrar']);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 20, ip);
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const json = await req.json().catch(() => null);
        const parsed = createSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const data = parsed.data;

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

        await dbConnect();

        const assessment = await Assessment.create({
            title: data.title,
            description: data.description,
            type: data.type,
            courseId: data.courseId,
            createdBy: auth.uid,
            questions: data.questions,
            durationMinutes: data.durationMinutes,
            opensAt: new Date(data.opensAt),
            closesAt: new Date(data.closesAt),
            status: 'draft',
        });

        return NextResponse.json(assessment, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
});
