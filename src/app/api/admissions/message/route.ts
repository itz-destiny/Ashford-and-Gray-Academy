import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { sendEmail, emailTemplates } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

const ADMISSIONS_ROLES = ['admin', 'registrar', 'admissions_officer'] as const;

// Broadcasts to a large roster are sent in throttled batches (see below) and
// can legitimately take minutes for a few hundred recipients.
export const maxDuration = 300;

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admissions/message route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

const bodySchema = z.object({
    subject: z.string().min(1).max(200),
    message: z.string().min(1).max(5000),
    uids: z.array(z.string()).max(1000).optional(), // omit / empty = every student
});

// =============================================================================
// POST /api/admissions/message — send a custom announcement email to either
// every real student, or a specific set (by uid) selected in the roster UI.
// =============================================================================
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ADMISSIONS_ROLES);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 5, ip);
        } catch {
            return NextResponse.json({ error: 'Too many requests — please wait a minute before sending another broadcast.' }, { status: 429 });
        }

        const json = await req.json().catch(() => null);
        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const { subject, message, uids } = parsed.data;

        await dbConnect();

        const query = uids && uids.length > 0
            ? { role: 'student', uid: { $in: uids } }
            : { role: 'student' };

        const students = await User.find(query)
            .select('uid displayName email')
            .lean<{ uid: string; displayName: string; email: string }[]>();

        if (students.length === 0) {
            return NextResponse.json({ error: 'No matching students found' }, { status: 404 });
        }

        // Resend's default rate limit is 2 requests/second — batch small and
        // pace between batches so a large broadcast doesn't get itself 429'd.
        const BATCH_SIZE = 2;
        const BATCH_DELAY_MS = 600;
        const results: { uid: string; email: string; success: boolean; error?: string }[] = [];
        for (let i = 0; i < students.length; i += BATCH_SIZE) {
            const batch = students.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(batch.map(async (s) => {
                try {
                    const tpl = emailTemplates.adminAnnouncement({
                        recipientName: s.displayName || s.email,
                        subject,
                        message,
                    });
                    const res = await sendEmail({ to: s.email, subject: tpl.subject, html: tpl.html });
                    return { uid: s.uid, email: s.email, success: res.success, error: res.success ? undefined : String(res.error) };
                } catch (err) {
                    return { uid: s.uid, email: s.email, success: false, error: String(err) };
                }
            }));
            results.push(...batchResults);
            if (i + BATCH_SIZE < students.length) {
                await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
            }
        }

        const sent = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success);

        return NextResponse.json({ sent, failed: failed.length, total: students.length, failures: failed });
    } catch (err) {
        return handleError(err);
    }
});
