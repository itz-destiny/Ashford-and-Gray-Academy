import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PlatformSettings from '@/models/PlatformSettings';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { sendEmail, emailTemplates } from '@/lib/email';
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
    console.error('admissions/students/[uid]/send-whatsapp route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// POST /api/admissions/students/[uid]/send-whatsapp — email a single student
// the institution's WhatsApp community invite link (from PlatformSettings).
// =============================================================================
export const POST = withAuth<RouteParams>(async (req: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ADMISSIONS_ROLES);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 30, ip);
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { uid } = await params;
        await dbConnect();

        const student = await User.findOne({ uid, role: 'student' }).lean<{ uid: string; displayName: string; email: string } | null>();
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const settings = await PlatformSettings.findOne({ key: 'default' }).lean<{ whatsappCommunityUrl?: string } | null>();
        if (!settings?.whatsappCommunityUrl) {
            return NextResponse.json({ error: 'No WhatsApp community link is configured. Set one in Registrar Settings first.' }, { status: 400 });
        }

        const tpl = emailTemplates.whatsappGroups({
            recipientName: student.displayName || student.email,
            communityUrl: settings.whatsappCommunityUrl,
        });
        const result = await sendEmail({ to: student.email, subject: tpl.subject, html: tpl.html });
        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 502 });
        }

        return NextResponse.json({ success: true, email: student.email });
    } catch (err) {
        return handleError(err);
    }
});
