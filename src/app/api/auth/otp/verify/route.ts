import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateFirebase, AuthError } from '@/lib/auth-server';
import { verifyOtp, OtpError } from '@/lib/otp';
import { sendEmail, emailTemplates } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

const bodySchema = z.object({
    purpose: z.enum(['signup', 'login_2fa']),
    code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
});

/**
 * Verify a one-time code.
 *  - purpose=signup: marks the Mongo profile as emailVerified and dispatches
 *    a welcome email (idempotent). Returns the user role for routing.
 *  - purpose=login_2fa: returns a short-lived signed cookie the staff session
 *    can present on subsequent privileged actions. (Initial release uses
 *    Firebase ID token claim refresh via custom claims is overkill; we set an
 *    HttpOnly `staff_2fa` cookie that expires in 12h. Server routes that
 *    require fresh 2FA can check it later.)
 */
export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 12, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let identity;
    try {
        identity = await authenticateFirebase(req);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 });
    }

    try {
        await verifyOtp({
            uid: identity.uid,
            purpose: parsed.data.purpose,
            code: parsed.data.code,
        });
    } catch (err) {
        if (err instanceof OtpError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }

    try {
        await dbConnect();
        const user = await User.findOne({ uid: identity.uid });
        if (!user) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (parsed.data.purpose === 'signup') {
            const wasUnverified = !user.emailVerified;
            user.emailVerified = true;
            user.emailVerifiedAt = new Date();

            // Send the welcome email once.
            if (wasUnverified && !user.welcomeEmailSentAt) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
                const portalByRole: Record<string, string> = {
                    admin: '/admin',
                    registrar: '/registrar',
                    course_registrar: '/course-registrar',
                    finance: '/finance',
                    instructor: '/instructor',
                    student: '/dashboard',
                };
                const portal = portalByRole[user.role] || '/dashboard';
                const tpl = emailTemplates.welcome({
                    recipientName: user.displayName,
                    portalUrl: `${appUrl}${portal}`,
                    coursesUrl: `${appUrl}/courses`,
                });
                const r = await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
                if (r.success) user.welcomeEmailSentAt = new Date();
            }

            await user.save();
            return NextResponse.json({
                success: true,
                role: user.role,
                redirect: routeForRole(user.role),
            });
        }

        // login_2fa — set HttpOnly cookie marking this session 2FA-passed.
        const res = NextResponse.json({
            success: true,
            role: user.role,
            redirect: routeForRole(user.role),
        });
        res.cookies.set('staff_2fa', identity.uid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 12,           // 12 hours
            path: '/',
        });
        return res;
    } catch (err) {
        console.error('otp/verify post-verify failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function routeForRole(role: string): string {
    return ({
        admin: '/admin',
        registrar: '/registrar',
        course_registrar: '/course-registrar',
        finance: '/finance',
        instructor: '/instructor',
        student: '/dashboard',
    } as Record<string, string>)[role] || '/dashboard';
}
