import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const { to, subject, message } = await request.json();

        if (!to || !subject || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await sendEmail({
            to,
            subject,
            text: message,
            html: `<p>${message}</p>`,
        });

        if (result) {
            return NextResponse.json({ success: true, messageId: result.messageId });
        } else {
            return NextResponse.json({ error: 'Email configuration missing' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
