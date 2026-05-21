import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { withAuth, type AuthContext } from '@/lib/auth-server';
import { sendEmail, emailTemplates } from '@/lib/email';

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
        const enrollments = await Enrollment.find({ userId: targetUserId })
            .populate('courseId')
            .exec();

        const formatted = enrollments.map(enr => ({
            id: enr._id,
            userId: enr.userId,
            courseId: enr.courseId?._id,
            enrolledAt: enr.enrolledAt,
            course: enr.courseId,
        }));
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

        const existing = await Enrollment.findOne({ userId, courseId });
        if (existing) {
            return NextResponse.json({ message: 'Already enrolled', enrollment: existing });
        }

        const enrollment = await Enrollment.create({ userId, courseId });

        // Fire-and-forget enrollment confirmation email. Failures are logged
        // inside sendEmail and never block the API response.
        try {
            const course = await Course.findById(courseId).select('title').lean<{ title?: string } | null>();
            if (course?.title && auth.email) {
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
