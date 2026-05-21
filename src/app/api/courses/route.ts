import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { rateLimit } from '@/lib/rate-limit';
import {
    tryAuthenticate,
    withAuth,
    requireRole,
    AuthError,
    type AuthContext,
    type Role,
} from '@/lib/auth-server';

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

const ELEVATED: readonly Role[] = ['admin', 'instructor', 'course_registrar', 'registrar'];

function isElevated(auth: AuthContext | null): boolean {
    return !!auth && ELEVATED.includes(auth.role);
}

// =============================================================================
// GET /api/courses
//   Unauthenticated / student: only courses with status='published'.
//   Elevated (admin / instructor / course_registrar / registrar): all courses,
//     so they can see their own drafts.
// =============================================================================
export async function GET(req: NextRequest): Promise<Response> {
    try {
        await dbConnect();
        const auth = await tryAuthenticate(req);
        const { searchParams } = new URL(req.url);
        const instructorName = searchParams.get('instructorName');

        const query: Record<string, unknown> = {};
        if (instructorName) query['instructor.name'] = instructorName;
        if (!isElevated(auth)) query.status = 'published';

        const [courses, enrollments] = await Promise.all([
            Course.find(query),
            Enrollment.find({}),
        ]);

        const enrollmentCounts: Record<string, number> = {};
        for (const en of enrollments) {
            if (!en.courseId) continue;
            const cid = en.courseId.toString();
            enrollmentCounts[cid] = (enrollmentCounts[cid] || 0) + 1;
        }

        const result = courses.map(course => ({
            ...course.toObject(),
            id: course._id.toString(),
            enrollmentCount: enrollmentCounts[course._id.toString()] || 0,
        }));
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('GET /api/courses failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// =============================================================================
// POST /api/courses — create. Instructor / admin / course_registrar only.
// New courses default to status='draft' so they can be reviewed before going
// live (clients can override this only if the caller is admin).
// =============================================================================
const createSchema = z.object({
    title: z.string().min(1).max(300),
    category: z.string().min(1).max(120),
    instructor: z.object({
        name: z.string().min(1).max(200),
        avatarUrl: z.string().url().or(z.literal('')).optional(),
        verified: z.boolean().optional(),
    }),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.number().int().min(0).optional(),
    duration: z.number().min(0),
    level: z.string().min(1).max(60),
    price: z.number().min(0),
    originalPrice: z.number().min(0).optional(),
    imageUrl: z.string().min(1).max(500),
    imageHint: z.string().min(1).max(200),
    description: z.string().min(1).max(10000),
    curriculum: z.array(z.string().max(500)).optional(),
    status: z.enum(['draft', 'pending', 'published', 'archived']).optional(),
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

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    try {
        await limiter.check(null, 3, ip);
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

    try {
        await dbConnect();
        // Non-admins cannot publish on create; force draft.
        const payload = { ...parsed.data, instructorUid: auth.uid };
        if (auth.role !== 'admin' && payload.status === 'published') {
            payload.status = 'draft';
        }
        const course = await Course.create(payload);
        return NextResponse.json(course, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/courses failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
