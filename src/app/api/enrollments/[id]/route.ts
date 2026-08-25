import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { sendEmail, emailTemplates } from '@/lib/email';
import { resolveCourse } from '@/lib/resolve-course';
import { getEmailUrl } from '@/lib/app-url';

type RouteParams = { params: Promise<{ id: string }> };

const patchSchema = z.object({
    courseId: z.string().min(1),
});

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('enrollments/[id] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// PATCH /api/enrollments/[id] — move a student to a different course
// ("switch department"). Admin / registrar / admissions_officer only. Fires
// the courseChanged email server-side so the notification always happens,
// regardless of which UI triggered the switch.
// =============================================================================
export const PATCH = withAuth<RouteParams>(async (request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ['admin', 'registrar', 'admissions_officer']);

        const { id } = await params;
        const json = await request.json().catch(() => null);
        const parsed = patchSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const { courseId: newCourseId } = parsed.data;

        await dbConnect();

        const enrollment = await Enrollment.findById(id);
        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        if (enrollment.courseId.toString() === newCourseId) {
            return NextResponse.json({ error: 'Student is already in that course.' }, { status: 409 });
        }
        const dupe = await Enrollment.findOne({
            userId: enrollment.userId,
            courseId: newCourseId,
            _id: { $ne: enrollment._id },
        });
        if (dupe) {
            return NextResponse.json({ error: 'Student already has an enrollment in that course.' }, { status: 409 });
        }

        const [previousCourse, newCourse] = await Promise.all([
            resolveCourse(enrollment.courseId.toString()),
            resolveCourse(newCourseId),
        ]);
        if (!newCourse) {
            return NextResponse.json({ error: 'Target course not found' }, { status: 404 });
        }

        enrollment.courseId = newCourseId as any;
        await enrollment.save();

        try {
            const student = await User.findOne({ uid: enrollment.userId })
                .select('displayName email')
                .lean<{ displayName: string; email: string } | null>();
            if (student?.email) {
                const appUrl = getEmailUrl();
                const tpl = emailTemplates.courseChanged({
                    recipientName: student.displayName || 'Student',
                    previousCourseName: previousCourse?.title || 'your previous programme',
                    newCourseName: newCourse.title,
                    loginUrl: `${appUrl}/login`,
                });
                void sendEmail({ to: student.email, subject: tpl.subject, html: tpl.html });
            }
        } catch (mailErr) {
            console.warn('courseChanged email skipped:', mailErr);
        }

        return NextResponse.json(enrollment);
    } catch (err) {
        return handleError(err);
    }
});
