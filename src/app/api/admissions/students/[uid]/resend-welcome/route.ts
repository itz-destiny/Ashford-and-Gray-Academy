import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { adminAuth } from '@/lib/firebase-admin';
import { resolveCourses } from '@/lib/resolve-course';
import { generateTempPassword } from '@/lib/generate-password';
import { issueMagicLoginLink } from '@/lib/magic-login';
import { sendEmail, emailTemplates } from '@/lib/email';
import { getEmailUrl } from '@/lib/app-url';
import { rateLimit } from '@/lib/rate-limit';

const ADMISSIONS_ROLES = ['admin', 'registrar', 'admissions_officer'] as const;
type RouteParams = { params: Promise<{ uid: string }> };

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admissions/students/[uid]/resend-welcome route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// POST /api/admissions/students/[uid]/resend-welcome — smart resend: only
// resets the password (and sends full credentials) for a student who has
// NEVER actually signed in (checked via Firebase Auth's real sign-in
// history, not guessed) — that's the case where they likely never received
// or lost their original temp password. A student who has already signed in
// has necessarily set their own password already; resetting it would wipe
// out something they chose without their knowledge, so instead they get a
// login reminder pointing at the self-service "Forgot Password" flow.
// =============================================================================
export const POST = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ADMISSIONS_ROLES);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 20, ip);
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { uid } = await params;
        await dbConnect();

        const student = await User.findOne({ uid, role: 'student' }).lean<{ uid: string; displayName: string; email: string } | null>();
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const fbAuth = adminAuth();
        let fbUser;
        try {
            fbUser = await fbAuth.getUser(uid);
        } catch (err: any) {
            if (err?.errorInfo?.code === 'auth/user-not-found') {
                return NextResponse.json({ error: 'No Firebase account found for this student' }, { status: 404 });
            }
            throw err;
        }
        const hasLoggedIn = !!fbUser.metadata.lastSignInTime;

        const enrollment = await Enrollment.findOne({ userId: uid }).lean<{ courseId: unknown } | null>();
        let courseName: string | undefined;
        if (enrollment?.courseId) {
            const courseMap = await resolveCourses([enrollment.courseId.toString()]);
            courseName = courseMap.get(enrollment.courseId.toString())?.title;
        }

        const appUrl = getEmailUrl();
        const loginUrl = `${appUrl}/login`;

        if (hasLoggedIn) {
            const tpl = emailTemplates.loginReminder({
                recipientName: student.displayName || student.email,
                email: student.email,
                loginUrl,
                courseName,
            });
            const result = await sendEmail({ to: student.email, subject: tpl.subject, html: tpl.html });
            if (!result.success) {
                return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 502 });
            }
            return NextResponse.json({ success: true, email: student.email, passwordReset: false });
        }

        const password = generateTempPassword(student.displayName || student.email);
        await fbAuth.updateUser(uid, { password });
        await User.updateOne({ uid }, { $set: { mustChangePassword: true } });
        const magicLoginUrl = await issueMagicLoginLink(uid);

        const tpl = emailTemplates.enrollmentWelcome({
            recipientName: student.displayName || student.email,
            email: student.email,
            password,
            loginUrl,
            courseName,
            magicLoginUrl,
        });
        const result = await sendEmail({ to: student.email, subject: tpl.subject, html: tpl.html });
        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 502 });
        }

        return NextResponse.json({ success: true, email: student.email, passwordReset: true });
    } catch (err) {
        return handleError(err);
    }
});
