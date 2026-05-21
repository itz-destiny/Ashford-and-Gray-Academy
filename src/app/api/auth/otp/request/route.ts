import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateFirebase, AuthError } from '@/lib/auth-server';
import { issueOtp, OtpError } from '@/lib/otp';
import { sendEmail, emailTemplates } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

const bodySchema = z.object({
    purpose: z.enum(['signup', 'login_2fa']),
});

/**
 * Issue a one-time code. Requires only a valid Firebase ID token — the user
 * may not yet have a Mongo profile (signup case) or may be mid-2FA.
 */
export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 6, ip);
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

    if (!identity.email) {
        return NextResponse.json({ error: 'Email not on account' }, { status: 400 });
    }

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    try {
        await dbConnect();
        const profile = await User.findOne({ uid: identity.uid }).lean<{ displayName?: string } | null>();
        const recipientName = profile?.displayName || identity.email.split('@')[0];

        const { code } = await issueOtp({
            uid: identity.uid,
            email: identity.email,
            purpose: parsed.data.purpose,
        });

        const template =
            parsed.data.purpose === 'signup'
                ? emailTemplates.signupOtp({ recipientName, code, expiresInMinutes: 10 })
                : emailTemplates.loginOtp({ recipientName, code, expiresInMinutes: 10 });

        const result = await sendEmail({
            to: identity.email,
            subject: template.subject,
            html: template.html,
        });
        if (!result.success) {
            console.warn('otp/request: email send failed but code was issued');
        }

        return NextResponse.json({ success: true, expiresInSeconds: 600 });
    } catch (err) {
        if (err instanceof OtpError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('otp/request failed:', err);
        return NextResponse.json({ error: 'Could not issue verification code' }, { status: 500 });
    }
}
