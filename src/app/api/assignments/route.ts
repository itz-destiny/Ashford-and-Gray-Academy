import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Assignment, Submission } from '@/models/Supports';
import { AuthError, withAuth, type AuthContext, type Role } from '@/lib/auth-server';

const INSTRUCTOR_ROLES: readonly Role[] = ['admin', 'instructor', 'course_registrar'];

function isInstructor(auth: AuthContext): boolean {
    return INSTRUCTOR_ROLES.includes(auth.role);
}

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('assignments route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/assignments
//   ?assignmentId&userId=<self>  -> the caller's submission for that assignment
//   ?assignmentId&userId=<other> -> instructor/admin only
//   ?assignmentId                -> any authenticated user reads the assignment
//   ?courseId / ?moduleId        -> list assignments (any authenticated user)
// =============================================================================
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const assignmentId = searchParams.get('assignmentId');
        const courseId = searchParams.get('courseId');
        const moduleId = searchParams.get('moduleId');
        const userId = searchParams.get('userId');

        if (assignmentId && userId) {
            if (userId !== auth.uid && !isInstructor(auth)) {
                return NextResponse.json(
                    { error: 'You can only read your own submission.' },
                    { status: 403 }
                );
            }
            const submission = await Submission.findOne({ assignmentId, userId });
            return NextResponse.json(submission);
        }

        if (assignmentId) {
            const assignment = await Assignment.findById(assignmentId);
            return NextResponse.json(assignment);
        }

        const query: Record<string, unknown> = {};
        if (courseId) query.courseId = courseId;
        if (moduleId) query.moduleId = moduleId;
        const assignments = await Assignment.find(query).sort({ createdAt: 1 });
        return NextResponse.json(assignments);
    } catch (err) {
        return handleError(err);
    }
});

const assignmentSchema = z.object({
    courseId: z.string().min(1),
    moduleId: z.string().optional(),
    title: z.string().min(1).max(300),
    description: z.string().min(1).max(10000),
    dueDate: z.string().optional(),
    points: z.number().min(0).optional(),
});

const submissionSchema = z.object({
    assignmentId: z.string().min(1),
    content: z.string().min(1).max(50000),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        await dbConnect();
        const body = await req.json().catch(() => null);
        if (!body || typeof body.type !== 'string') {
            return NextResponse.json({ error: 'type is required' }, { status: 400 });
        }

        if (body.type === 'assignment') {
            if (!isInstructor(auth)) {
                return NextResponse.json(
                    { error: 'Only instructors or admins can create assignments.' },
                    { status: 403 }
                );
            }
            const parsed = assignmentSchema.safeParse(body.data);
            if (!parsed.success) {
                return NextResponse.json(
                    { error: 'Invalid request', details: parsed.error.flatten() },
                    { status: 400 }
                );
            }
            const assignment = await Assignment.create(parsed.data);
            return NextResponse.json(assignment, { status: 201 });
        }

        if (body.type === 'submission') {
            const parsed = submissionSchema.safeParse(body.data);
            if (!parsed.success) {
                return NextResponse.json(
                    { error: 'Invalid request', details: parsed.error.flatten() },
                    { status: 400 }
                );
            }
            // Always use the authenticated uid; client-supplied userId is ignored.
            const submission = await Submission.create({
                assignmentId: parsed.data.assignmentId,
                content: parsed.data.content,
                userId: auth.uid,
            });
            return NextResponse.json(submission, { status: 201 });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (err) {
        return handleError(err);
    }
});

const putSchema = z.object({
    type: z.enum(['assignment', 'submission']),
    id: z.string().min(1),
    data: z.record(z.string(), z.unknown()),
});

export const PUT = withAuth(async (req: NextRequest, { auth }) => {
    try {
        await dbConnect();
        const json = await req.json().catch(() => null);
        const parsed = putSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        if (parsed.data.type === 'assignment') {
            if (!isInstructor(auth)) {
                return NextResponse.json(
                    { error: 'Only instructors or admins can update assignments.' },
                    { status: 403 }
                );
            }
            const updated = await Assignment.findByIdAndUpdate(parsed.data.id, parsed.data.data, {
                new: true,
            });
            return NextResponse.json(updated);
        }

        // submission update: students may update their own pre-grade; grading is
        // instructor-only.
        const submission = await Submission.findById(parsed.data.id);
        if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const isGrading =
            'grade' in parsed.data.data || 'feedback' in parsed.data.data;
        if (isGrading && !isInstructor(auth)) {
            return NextResponse.json(
                { error: 'Only instructors or admins can grade submissions.' },
                { status: 403 }
            );
        }
        if (!isInstructor(auth) && submission.userId !== auth.uid) {
            return NextResponse.json(
                { error: 'You can only edit your own submission.' },
                { status: 403 }
            );
        }

        Object.assign(submission, parsed.data.data);
        await submission.save();
        return NextResponse.json(submission);
    } catch (err) {
        return handleError(err);
    }
});

export const DELETE = withAuth(async (req: NextRequest, { auth }) => {
    try {
        if (!isInstructor(auth)) {
            return NextResponse.json(
                { error: 'Only instructors or admins can delete assignments.' },
                { status: 403 }
            );
        }
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        if (type === 'assignment' && id) {
            await Assignment.findByIdAndDelete(id);
            await Submission.deleteMany({ assignmentId: id });
            return NextResponse.json({ message: 'Assignment deleted' });
        }
        return NextResponse.json({ error: 'Invalid type/id' }, { status: 400 });
    } catch (err) {
        return handleError(err);
    }
});
