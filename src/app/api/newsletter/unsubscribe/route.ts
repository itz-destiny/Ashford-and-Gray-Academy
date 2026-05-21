import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail, emailTemplates } from '@/lib/email';
import {
    NewsletterTokenError,
    verifyNewsletterToken,
    buildConfirmUrl,
    buildUnsubscribeUrl,
} from '@/lib/newsletter-tokens';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 });

export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/unsubscribe?token=...
 * Token comes from the unsubscribe footer of any newsletter email. Always
 * redirects to a public page so the user sees confirmation.
 */
export async function GET(req: NextRequest): Promise<Response> {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/$/, '');
    const token = new URL(req.url).searchParams.get('token');
    if (!token) {
        return NextResponse.redirect(`${appUrl}/newsletter/unsubscribed?status=error&reason=missing`);
    }

    try {
        const { email } = verifyNewsletterToken(token, 'unsubscribe');
        await dbConnect();
        const result = await Newsletter.findOneAndUpdate(
            { email },
            { $set: { unsubscribedAt: new Date() } },
            { new: true }
        );
        if (!result) {
            // Already unknown — show success anyway so we don't leak list membership.
            return NextResponse.redirect(`${appUrl}/newsletter/unsubscribed?status=ok`);
        }
        return NextResponse.redirect(`${appUrl}/newsletter/unsubscribed?status=ok`);
    } catch (err) {
        const reason =
            err instanceof NewsletterTokenError
                ? err.status === 410 ? 'expired' : 'invalid'
                : 'invalid';
        return NextResponse.redirect(`${appUrl}/newsletter/unsubscribed?status=error&reason=${reason}`);
    }
}

/**
 * POST /api/newsletter/unsubscribe
 * Used by the public "I lost my unsubscribe link" form. We never confirm or
 * deny membership; we always return success and only actually email an
 * unsubscribe link to confirmed subscribers.
 */
const postSchema = z.object({ email: z.string().email().max(254) });

export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 5, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase();

    try {
        await dbConnect();
        const subscriber = await Newsletter.findOne({ email });

        // Only send a real unsubscribe link if the address is actually on file
        // AND not already unsubscribed. The response is always success, so a
        // bad actor can't enumerate subscribers.
        if (subscriber && !subscriber.unsubscribedAt) {
            try {
                const confirmUrl = buildConfirmUrl(email);
                const unsubscribeUrl = buildUnsubscribeUrl(email);
                const tpl = emailTemplates.newsletterConfirm({ email, confirmUrl, unsubscribeUrl });
                // We re-use the confirmation template's body and tack a custom
                // subject so the unsubscribe link in the footer is what they
                // need. (A dedicated template can come later if desired.)
                void sendEmail({
                    to: email,
                    subject: 'Your Ashford & Gray unsubscribe link',
                    html: tpl.html,
                });
            } catch (mailErr) {
                console.warn('unsubscribe link email failed:', mailErr);
            }
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('newsletter unsubscribe request failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
