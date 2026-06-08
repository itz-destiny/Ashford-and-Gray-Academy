import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import { withAuth, type AuthContext } from '@/lib/auth-server';
import { sendEmail, emailTemplates } from '@/lib/email';
import { resolveCourse, resolveCourses } from '@/lib/resolve-course';

const ELEVATED_ROLES = ['admin', 'instructor', 'registrar', 'course_registrar'] as const;

function isElevated(auth: AuthContext): boolean {
    return (ELEVATED_ROLES as readonly string[]).includes(auth.role);
}

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    // Students can only read their own enrollments. Elevated roles may pass an
    // explicit ?userId=X to read someone else's.
    const targetUserId = requestedUserId ?? auth.uid;
    if (targetUserId !== auth.uid && !isElevated(auth)) {
        return NextResponse.json(
            { error: 'You can only read your own enrollments.' },
            { status: 403 }
        );
    }

    try {
        await dbConnect();
        // Don't populate — a catalogue course has no Course document, and
        // populate would null out the id. Resolve each course from the DB or
        // the static catalogue instead.
        const enrollments = await Enrollment.find({ userId: targetUserId }).lean();
        const courseMap = await resolveCourses(
            enrollments.map(enr => enr.courseId?.toString()).filter(Boolean) as string[]
        );

        const formatted = enrollments.map(enr => {
            const cid = enr.courseId?.toString();
            const course = (cid && courseMap.get(cid)) || null;
            return {
                id: enr._id,
                userId: enr.userId,
                courseId: cid,
                enrolledAt: enr.enrolledAt,
                progress: enr.progress ?? 0,
                course: course ? { ...course, progress: enr.progress ?? course.progress ?? 0 } : null,
            };
        });
        return NextResponse.json(formatted);
    } catch (error: any) {
        console.error('GET /api/enrollments failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

const postSchema = z.object({
    courseId: z.string().min(1),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        // Identity is always derived from the verified token, never the client.
        const userId = auth.uid;
        const { courseId } = parsed.data;

        // Validate the course exists (DB or static catalogue) without creating
        // a backend Course document.
        const course = await resolveCourse(courseId);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const existing = await Enrollment.findOne({ userId, courseId });
        if (existing) {
            return NextResponse.json({ message: 'Already enrolled', enrollment: existing });
        }

        const enrollment = await Enrollment.create({ userId, courseId });

        // Fire-and-forget enrollment confirmation email. Failures are logged
        // inside sendEmail and never block the API response.
        try {
            if (course.title && auth.email) {
                const { getAppUrl } = await import('@/lib/app-url');
                const appUrl = getAppUrl();
                const tpl = emailTemplates.enrollment({
                    studentName: auth.displayName || 'Student',
                    courseName: course.title,
                    courseUrl: `${appUrl}/my-courses/${courseId}`,
                });
                void sendEmail({ to: auth.email, subject: tpl.subject, html: tpl.html });
            }
        } catch (mailErr) {
            console.warn('enrollment email skipped:', mailErr);
        }

        return NextResponse.json(enrollment, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/enrollments failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
