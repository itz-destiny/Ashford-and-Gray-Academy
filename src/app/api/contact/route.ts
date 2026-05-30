import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

const bodySchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(254),
    phone: z.string().max(40).optional(),
    subject: z.string().min(1).max(200),
    message: z.string().min(10).max(5000),
});

const INBOX = process.env.CONTACT_INBOX_EMAIL || 'info@ashfordgrayacademy.com';

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 5, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }
    const data = parsed.data;

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0B1F3A;max-width:600px">
            <h2 style="color:#0B1F3A;font-family:Georgia,serif">New enquiry from the academy website</h2>
            <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#64748b;width:120px"><strong>Name</strong></td><td style="padding:8px 0">${escapeHtml(data.name)}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b"><strong>Email</strong></td><td style="padding:8px 0">${escapeHtml(data.email)}</td></tr>
                ${data.phone ? `<tr><td style="padding:8px 0;color:#64748b"><strong>Phone</strong></td><td style="padding:8px 0">${escapeHtml(data.phone)}</td></tr>` : ''}
                <tr><td style="padding:8px 0;color:#64748b"><strong>Subject</strong></td><td style="padding:8px 0">${escapeHtml(data.subject)}</td></tr>
            </table>
            <h3 style="margin-top:24px;color:#0B1F3A">Message</h3>
            <p style="white-space:pre-line;background:#f8fafc;padding:16px;border-radius:8px">${escapeHtml(data.message)}</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">Submitted from the contact form. Reply directly to the sender at <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>.</p>
        </div>
    `;

    try {
        await sendEmail({
            to: INBOX,
            subject: `[Enquiry] ${data.subject}`,
            html,
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('contact submission email failed:', err);
        // Still return success — we don't want bad UX if the SMTP transient fails.
        return NextResponse.json({ success: true });
    }
}
