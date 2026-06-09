import { Resend } from 'resend';

/**
 * Transactional email is sent via Resend (https://resend.com).
 *
 * Configuration:
 *   RESEND_API_KEY   required to actually deliver mail
 *   EMAIL_FROM       sender address. Defaults to `onboarding@resend.dev`,
 *                    which Resend lets you use immediately without verifying
 *                    a domain — great for development and first deploys.
 *                    Switch to e.g. `"Ashford & Gray Academy <hello@your-domain.com>"`
 *                    once you've added your domain in the Resend dashboard.
 *
 * If RESEND_API_KEY is not set, `sendEmail` logs a warning and returns a
 * `{ success: false }` shape instead of throwing. Callers (notifications,
 * payment receipts) treat email as best-effort and continue regardless.
 */

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

interface SendResult {
    success: boolean;
    messageId?: string;
    error?: unknown;
}

const DEFAULT_FROM = 'Ashford & Gray Academy <onboarding@resend.dev>';

let cachedClient: Resend | null = null;

function getResend(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    if (!cachedClient) cachedClient = new Resend(apiKey);
    return cachedClient;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions): Promise<SendResult> {
    const client = getResend();
    if (!client) {
        console.warn('sendEmail: RESEND_API_KEY not configured — skipping email.');
        return { success: false };
    }

    try {
        const sender = from || process.env.EMAIL_FROM || DEFAULT_FROM;
        const result = await client.emails.send({ from: sender, to, subject, html });
        if (result.error) {
            console.error('sendEmail: Resend rejected message:', result.error);
            return { success: false, error: result.error };
        }
        return { success: true, messageId: result.data?.id };
    } catch (error) {
        console.error('sendEmail: unexpected error:', error);
        return { success: false, error };
    }
}

// Email Templates
export const emailTemplates = {
    enrollment: (data: { studentName: string; courseName: string; courseUrl: string }) => ({
        subject: `Welcome to ${data.courseName}!`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 Enrollment Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${data.studentName},</p>
                        <p>Congratulations! You've been successfully enrolled in <strong>${data.courseName}</strong>.</p>
                        <p>You can now access all course materials, lessons, and resources. Start your learning journey today!</p>
                        <a href="${data.courseUrl}" class="button">Start Learning →</a>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Ashford & Gray Fusion Academy. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    newMessage: (data: { recipientName: string; senderName: string; messagePreview: string; conversationUrl: string }) => ({
        subject: `New message from ${data.senderName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .message-preview { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>💬 New Message</h2>
                    </div>
                    <div class="content">
                        <p>Hi ${data.recipientName},</p>
                        <p>You have a new message from <strong>${data.senderName}</strong>:</p>
                        <div class="message-preview">
                            <p>${data.messagePreview}</p>
                        </div>
                        <a href="${data.conversationUrl}" class="button">View Conversation →</a>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    paymentSuccess: (data: { studentName: string; amount: number; courseName: string; transactionId: string }) => ({
        subject: 'Payment Successful - Receipt',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .receipt { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
                    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .total { font-size: 20px; font-weight: bold; color: #10b981; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>✅ Payment Successful</h2>
                    </div>
                    <div class="content">
                        <p>Hi ${data.studentName},</p>
                        <p>Your payment has been processed successfully!</p>
                        <div class="receipt">
                            <div class="receipt-row">
                                <span>Course:</span>
                                <strong>${data.courseName}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Amount:</span>
                                <strong class="total">$${data.amount.toFixed(2)}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Transaction ID:</span>
                                <span>${data.transactionId}</span>
                            </div>
                        </div>
                        <p>Thank you for your purchase!</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    systemAlert: (data: { userName: string; alertTitle: string; alertMessage: string }) => ({
        subject: `System Alert: ${data.alertTitle}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>⚠️ ${data.alertTitle}</h2>
                    </div>
                    <div class="content">
                        <p>Hi ${data.userName},</p>
                        <div class="alert">
                            <p>${data.alertMessage}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    welcome: (data: { recipientName: string; portalUrl: string; coursesUrl: string }) => ({
        subject: 'Welcome to Ashford & Gray Fusion Academy',
        html: brandedShell({
            preheader: `Welcome, ${data.recipientName}. Your academy account is ready.`,
            title: 'Your academy is ready',
            body: `
                <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px">Dear ${escapeHtml(data.recipientName)},</p>
                <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px">Welcome to Ashford &amp; Gray Fusion Academy. Your account is verified and your dashboard is waiting. From here you can browse the full catalogue, enrol in programmes, attend live classes with faculty, and track your academic progress.</p>
                <div style="text-align:center;margin:32px 0">
                    <a href="${data.portalUrl}" style="display:inline-block;background:#0B1F3A;color:#ffffff;text-decoration:none;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:11px;padding:16px 36px;border-radius:9999px">Open Your Dashboard</a>
                </div>
                <p style="font-size:14px;color:#64748b;margin:0 0 8px">Recommended next steps</p>
                <ul style="font-size:14px;line-height:1.8;color:#334155;padding-left:20px;margin:0">
                    <li>Browse the <a href="${data.coursesUrl}" style="color:#1F7A5A;text-decoration:none;font-weight:600">course catalogue</a></li>
                    <li>Complete your professional profile</li>
                    <li>Register for an upcoming academy event</li>
                </ul>
            `,
        }),
    }),

    newsletterConfirm: (data: {
        email: string;
        confirmUrl: string;
        unsubscribeUrl: string;
    }) => ({
        subject: 'Confirm your subscription to Ashford & Gray',
        html: brandedShell({
            preheader: 'One click to confirm your newsletter subscription.',
            title: 'Confirm your subscription',
            body: `
                <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px">Thank you for subscribing to Ashford &amp; Gray Fusion Academy updates. Confirm your email below and you'll start receiving curated dispatches on new programmes, faculty interviews, and upcoming events.</p>
                <div style="text-align:center;margin:32px 0">
                    <a href="${data.confirmUrl}" style="display:inline-block;background:#0B1F3A;color:#ffffff;text-decoration:none;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:11px;padding:16px 36px;border-radius:9999px">Confirm Subscription</a>
                </div>
                <p style="font-size:13px;color:#64748b;margin:24px 0 0;text-align:center">This link is valid for 7 days. If you didn't sign up, you can safely ignore this message — your address won't be added to our list.</p>
                ${newsletterFooter(data.email, data.unsubscribeUrl)}
            `,
        }),
    }),

    classReminder: (data: {
        recipientName: string;
        courseName: string;
        lessonTitle: string;
        startsAt: string;          // formatted local date/time string
        joinUrl: string;
    }) => ({
        subject: `Reminder: ${data.lessonTitle} starts soon`,
        html: brandedShell({
            preheader: `${data.lessonTitle} starts at ${data.startsAt}`,
            title: 'A live class begins soon',
            body: `
                <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px">Hello ${escapeHtml(data.recipientName)},</p>
                <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px">Your live session <strong>${escapeHtml(data.lessonTitle)}</strong> from <strong>${escapeHtml(data.courseName)}</strong> is scheduled to begin at <strong>${escapeHtml(data.startsAt)}</strong>.</p>
                <div style="text-align:center;margin:32px 0">
                    <a href="${data.joinUrl}" style="display:inline-block;background:#1F7A5A;color:#ffffff;text-decoration:none;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:11px;padding:16px 36px;border-radius:9999px">Join Live Class</a>
                </div>
                <p style="font-size:13px;color:#64748b;margin:0">For the best experience, join from a desktop browser with a stable connection a few minutes before the session begins.</p>
            `,
        }),
    }),
};

// ============================================================================
// Branded shell + helpers
// ============================================================================

/**
 * Compliance footer for any email that originates from a newsletter
 * subscription. Include in every broadcast we send to the `Newsletter`
 * collection so subscribers can always opt out.
 */
export function newsletterFooter(email: string, unsubscribeUrl: string): string {
    return `
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #F1F5F9;text-align:center">
            <p style="margin:0;color:#94A3B8;font-size:11px;line-height:1.6">This message was sent to <strong>${escapeHtml(email)}</strong> because they subscribed to Ashford &amp; Gray updates.</p>
            <p style="margin:8px 0 0;color:#94A3B8;font-size:11px;line-height:1.6"><a href="${unsubscribeUrl}" style="color:#64748B;text-decoration:underline">Unsubscribe</a> at any time.</p>
        </div>
    `;
}

function escapeHtml(input: string): string {
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function brandedShell(args: { preheader: string; title: string; body: string }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(args.title)}</title>
</head>
<body style="margin:0;padding:0;background:#FCFCFE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0B1F3A">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${escapeHtml(args.preheader)}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FCFCFE;padding:32px 16px">
    <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:32px;overflow:hidden;box-shadow:0 6px 30px rgba(11,31,58,0.06)">
            <tr><td style="background:#0B1F3A;padding:32px 32px 28px;text-align:center">
                <p style="margin:0;color:#C8A96A;font-weight:900;letter-spacing:0.35em;text-transform:uppercase;font-size:10px">Ashford &amp; Gray</p>
                <p style="margin:6px 0 0;color:#ffffff;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:13px">Fusion Academy</p>
            </td></tr>
            <tr><td style="padding:40px 36px 32px">
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;color:#0B1F3A;margin:0 0 16px">${escapeHtml(args.title)}</h1>
                ${args.body}
            </td></tr>
            <tr><td style="padding:24px 36px 36px;border-top:1px solid #F1F5F9">
                <p style="margin:0;color:#94A3B8;font-size:11px;line-height:1.6;text-align:center">&copy; ${new Date().getFullYear()} Ashford &amp; Gray Fusion Academy. This message was sent to you in connection with your account. If this was unexpected, please disregard.</p>
            </td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>`;
}
