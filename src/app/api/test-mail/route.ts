import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { assertDevEndpointAllowed } from '@/lib/dev-only';

const schema = z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    message: z.string().min(1).max(5000),
});

// Sends a probe email. Dev-only + admin-only — otherwise this is a spam relay.
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        assertDevEndpointAllowed();
        requireRole(auth, ['admin']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        const result = await sendEmail({
            to: parsed.data.to,
            subject: parsed.data.subject,
            html: `<p>${parsed.data.message}</p>`,
        });
        if (!result.success) {
            return NextResponse.json({ error: 'Email configuration missing' }, { status: 500 });
        }
        return NextResponse.json({ success: true, messageId: result.messageId });
    } catch (error: any) {
        console.error('test-mail failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
