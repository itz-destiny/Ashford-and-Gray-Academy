import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { NewsletterTokenError, verifyNewsletterToken } from '@/lib/newsletter-tokens';

export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/confirm?token=...
 * Verifies the signed JWT, marks the row confirmed, then 302-redirects to
 * the public success page. Always redirects (never serves JSON) so users
 * land somewhere readable even if they tap the link on mobile.
 */
export async function GET(req: NextRequest): Promise<Response> {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/$/, '');
    const token = new URL(req.url).searchParams.get('token');
    if (!token) {
        return NextResponse.redirect(`${appUrl}/newsletter/confirmed?status=error&reason=missing`);
    }

    try {
        const { email } = verifyNewsletterToken(token, 'confirm');
        await dbConnect();
        const result = await Newsletter.findOneAndUpdate(
            { email },
            { $set: { confirmedAt: new Date() }, $unset: { unsubscribedAt: '' } },
            { new: true }
        );
        if (!result) {
            return NextResponse.redirect(`${appUrl}/newsletter/confirmed?status=error&reason=unknown`);
        }
        return NextResponse.redirect(`${appUrl}/newsletter/confirmed?status=ok`);
    } catch (err) {
        const reason =
            err instanceof NewsletterTokenError
                ? err.status === 410 ? 'expired' : 'invalid'
                : 'invalid';
        return NextResponse.redirect(`${appUrl}/newsletter/confirmed?status=error&reason=${reason}`);
    }
}
