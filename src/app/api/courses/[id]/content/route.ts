import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { Module, Lesson } from '@/models/Supports';
import { AuthError, withAuth, type AuthContext } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

const ELEVATED = ['admin', 'course_registrar', 'registrar'];

async function isEnrolled(courseId: string, uid: string): Promise<boolean> {
    const en = await Enrollment.findOne({ courseId, userId: uid }).select('_id');
    return !!en;
}

async function isCourseOwner(courseId: string, auth: AuthContext): Promise<boolean> {
    if (auth.role !== 'instructor') return false;
    const course = await Course.findById(courseId).select('instructorUid instructor');
    if (!course) return false;
    if (course.instructorUid) return course.instructorUid === auth.uid;
    return course.instructor?.name === auth.displayName;
}

async function assertCanRead(courseId: string, auth: AuthContext) {
    if (ELEVATED.includes(auth.role)) return;
    if (await isCourseOwner(courseId, auth)) return;
    if (await isEnrolled(courseId, auth.uid)) return;
    throw new AuthError(403, 'You must enroll in this course to view its content.');
}

async function assertCanEdit(courseId: string, auth: AuthContext) {
    if (ELEVATED.includes(auth.role)) return;
    if (await isCourseOwner(courseId, auth)) return;
    throw new AuthError(403, 'Only the course owner or an admin can edit content.');
}

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('courses/[id]/content route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export const GET = withAuth<RouteParams>(async (_req: NextRequest, { auth, params }) => {
    try {
        const { id: courseId } = await params;
        await dbConnect();
        await assertCanRead(courseId, auth);

        const modules = await Module.find({ courseId }).sort({ order: 1 });
        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });
        return NextResponse.json({ modules, lessons });
    } catch (err) {
        return handleError(err);
    }
});

const postSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('module'),
        data: z.object({
            title: z.string().min(1).max(300),
            description: z.string().max(2000).optional(),
        }),
    }),
    z.object({
        type: z.literal('lesson'),
        data: z.object({
            moduleId: z.string().min(1),
            title: z.string().min(1).max(300),
            content: z.string().max(50000).optional(),
            videoUrl: z.string().url().optional().or(z.literal('')),
            duration: z.number().min(0).optional(),
            isLive: z.boolean().optional(),
            scheduledAt: z.string().datetime().optional(),
        }),
    }),
]);

export const POST = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        const { id: courseId } = await params;
        await dbConnect();
        await assertCanEdit(courseId, auth);

        const json = await req.json().catch(() => null);
        const parsed = postSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        if (parsed.data.type === 'module') {
            const last = await Module.findOne({ courseId }).sort({ order: -1 });
            const order = last ? last.order + 1 : 1;
            const module = await Module.create({ ...parsed.data.data, courseId, order });
            return NextResponse.json(module, { status: 201 });
        }

        // lesson
        const { moduleId } = parsed.data.data;
        const last = await Lesson.findOne({ moduleId }).sort({ order: -1 });
        const order = last ? last.order + 1 : 1;
        const lesson = await Lesson.create({ ...parsed.data.data, order });
        return NextResponse.json(lesson, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
});

const putSchema = z.object({
    type: z.enum(['module', 'lesson']),
    id: z.string().min(1),
    data: z.record(z.string(), z.unknown()),
});

export const PUT = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        const { id: courseId } = await params;
        await dbConnect();
        await assertCanEdit(courseId, auth);

        const json = await req.json().catch(() => null);
        const parsed = putSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const Model = parsed.data.type === 'module' ? Module : Lesson;
        const updated = await Model.findByIdAndUpdate(parsed.data.id, parsed.data.data, { new: true });
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        return handleError(err);
    }
});

export const DELETE = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        const { id: courseId } = await params;
        await dbConnect();
        await assertCanEdit(courseId, auth);

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        if (!id || !type) {
            return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
        }

        if (type === 'module') {
            await Module.findByIdAndDelete(id);
            await Lesson.deleteMany({ moduleId: id });
            return NextResponse.json({ message: 'Module deleted' });
        }
        if (type === 'lesson') {
            await Lesson.findByIdAndDelete(id);
            return NextResponse.json({ message: 'Lesson deleted' });
        }
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (err) {
        return handleError(err);
    }
});
