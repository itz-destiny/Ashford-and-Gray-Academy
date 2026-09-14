import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { adminAuth } from '@/lib/firebase-admin';
import { generateTempPassword } from '@/lib/generate-password';
import { issueMagicLoginLink } from '@/lib/magic-login';
import { sendEmail, emailTemplates } from '@/lib/email';
import { getEmailUrl } from '@/lib/app-url';
import { rateLimit } from '@/lib/rate-limit';
import { ROLE_TITLES } from '../../route';

type RouteParams = { params: Promise<{ uid: string }> };

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admin/users/[uid]/reset route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// POST /api/admin/users/[uid]/reset — the one-click "reset password + email
// a magic login link" action, for any account regardless of role. Replaces
// running a one-off script by hand for every real password-reset request.
// Admin only.
// =============================================================================
export const POST = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ['admin']);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 20, ip);
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        await dbConnect();
        const { uid } = await params;

        const user = await User.findOne({ uid });
        if (!user) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const tempPassword = generateTempPassword(user.displayName);
        await adminAuth().updateUser(uid, { password: tempPassword });
        await User.updateOne({ uid }, { $set: { mustChangePassword: true } });

        const magicLoginUrl = await issueMagicLoginLink(uid);
        const appUrl = getEmailUrl();
        const loginUrl = `${appUrl}/login`;
        const roleTitle = ROLE_TITLES[user.role] || 'Staff Member';

        const tpl = user.role === 'student'
            ? emailTemplates.enrollmentWelcome({ recipientName: user.displayName, email: user.email, password: tempPassword, loginUrl, magicLoginUrl })
            : emailTemplates.staffWelcome({ recipientName: user.displayName, email: user.email, password: tempPassword, loginUrl, roleTitle, magicLoginUrl });

        const result = await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
        if (!result.success) {
            return NextResponse.json({ error: 'Password was reset, but the email failed to send.' }, { status: 502 });
        }

        return NextResponse.json({ success: true, email: user.email, magicLoginUrl });
    } catch (err) {
        return handleError(err);
    }
});
