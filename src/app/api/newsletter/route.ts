import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail, emailTemplates } from '@/lib/email';
import { buildConfirmUrl, buildUnsubscribeUrl } from '@/lib/newsletter-tokens';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 });

const subscribeSchema = z.object({
    email: z.string().email().max(254),
    source: z.string().max(60).optional(),
});

/**
 * Public subscribe endpoint. Upserts the row and emails a one-click
 * confirmation link. Always returns the same {success:true} regardless of
 * whether the email was new or already on file — leaking that fact would let
 * anyone probe the subscriber list.
 */
export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 5, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    try {
        await dbConnect();
        await Newsletter.findOneAndUpdate(
            { email },
            {
                $setOnInsert: { email, source: parsed.data.source ?? 'landing' },
                $unset: { unsubscribedAt: '' },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Fire the confirmation email. We don't await its result because a
        // transient SMTP failure should not block the API response — and we
        // always return success regardless to avoid leaking list membership.
        try {
            const confirmUrl = buildConfirmUrl(email);
            const unsubscribeUrl = buildUnsubscribeUrl(email);
            const tpl = emailTemplates.newsletterConfirm({ email, confirmUrl, unsubscribeUrl });
            void sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
        } catch (mailErr) {
            console.warn('newsletter confirmation email skipped:', mailErr);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('newsletter signup failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Admin-only subscriber list. Used by /admin/newsletter.
 */
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'registrar']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // confirmed | pending | unsubscribed | all
        const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10) || 500, 1000);

        const query: Record<string, unknown> = {};
        if (status === 'confirmed') {
            query.confirmedAt = { $exists: true };
            query.unsubscribedAt = { $exists: false };
        } else if (status === 'pending') {
            query.confirmedAt = { $exists: false };
            query.unsubscribedAt = { $exists: false };
        } else if (status === 'unsubscribed') {
            query.unsubscribedAt = { $exists: true };
        }

        const [rows, totals] = await Promise.all([
            Newsletter.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
            Newsletter.aggregate([
                {
                    $facet: {
                        confirmed: [
                            { $match: { confirmedAt: { $exists: true }, unsubscribedAt: { $exists: false } } },
                            { $count: 'n' },
                        ],
                        pending: [
                            { $match: { confirmedAt: { $exists: false }, unsubscribedAt: { $exists: false } } },
                            { $count: 'n' },
                        ],
                        unsubscribed: [
                            { $match: { unsubscribedAt: { $exists: true } } },
                            { $count: 'n' },
                        ],
                        total: [{ $count: 'n' }],
                    },
                },
            ]),
        ]);

        const summary = {
            confirmed: totals[0]?.confirmed?.[0]?.n ?? 0,
            pending: totals[0]?.pending?.[0]?.n ?? 0,
            unsubscribed: totals[0]?.unsubscribed?.[0]?.n ?? 0,
            total: totals[0]?.total?.[0]?.n ?? 0,
        };

        return NextResponse.json({ subscribers: rows, summary });
    } catch (err) {
        console.error('newsletter list failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
