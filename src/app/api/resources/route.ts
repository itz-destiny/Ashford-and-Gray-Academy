import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Resource } from '@/models/Supports';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (req: NextRequest) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const type = searchParams.get('type');

        const query: Record<string, unknown> = {};
        if (courseId) query.courseId = courseId;
        if (type) query.type = type;

        const resources = await Resource.find(query).populate('courseId').sort({ createdAt: -1 });
        return NextResponse.json(resources);
    } catch (error: any) {
        console.error('GET /api/resources failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

const createSchema = z.object({
    title: z.string().min(1).max(300),
    type: z.enum(['PDF', 'Video', 'Slides', 'Code', 'Other']).optional(),
    courseId: z.string().optional(),
    url: z.string().url().min(1),
    fileHint: z.string().max(200).optional(),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'instructor', 'course_registrar']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    const json = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const resource = await Resource.create(parsed.data);
        return NextResponse.json(resource, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/resources failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
