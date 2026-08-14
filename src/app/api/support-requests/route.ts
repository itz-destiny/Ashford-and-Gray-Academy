import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Message, Conversation } from '@/models/Supports';
import User from '@/models/User';
import { withAuth } from '@/lib/auth-server';
import { publishMessage } from '@/lib/realtime-events';
import { createNotification } from '@/lib/notifications';
import { getEmailUrl } from '@/lib/app-url';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 200 });

const postSchema = z.object({
    subject: z.string().trim().min(3).max(150),
    message: z.string().trim().min(10).max(4000),
});

// POST /api/support-requests
// The Help page's "Ask an Academic Advisor" form. Creates (or reuses) a
// direct conversation between the student and the academy's designated
// advisor, tagged `kind: 'support'` so replies into it trigger an email
// notification back to the student (see POST /api/messages).
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 10, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Please fill in a subject and a message.', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();

        // Prefer a registrar (academic office) as the advisor; fall back to
        // an admin if no registrar account exists yet.
        let advisor = await User.findOne({ role: 'registrar' }).sort({ createdAt: 1 }).lean<{ uid: string; email: string; displayName: string; role: string } | null>();
        let advisorPortal = 'registrar';
        if (!advisor) {
            advisor = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).lean<{ uid: string; email: string; displayName: string; role: string } | null>();
            advisorPortal = 'admin';
        }
        if (!advisor) {
            return NextResponse.json({ error: 'No academic advisor is available right now. Please try again shortly.' }, { status: 503 });
        }

        const { subject, message } = parsed.data;

        // Reuse an existing open support thread with the same advisor rather
        // than spawning a new conversation for every request.
        let conversation = await Conversation.findOne({
            participants: { $all: [auth.uid, advisor.uid] },
            kind: 'support',
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [auth.uid, advisor.uid],
                type: 'direct',
                kind: 'support',
                title: subject,
                lastMessage: message,
                lastMessageAt: new Date(),
            });
        } else {
            conversation.title = subject;
            conversation.lastMessage = message;
            conversation.lastMessageAt = new Date();
            await conversation.save();
        }

        const content = `Subject: ${subject}\n\n${message}`;

        const savedMessage = await Message.create({
            senderId: auth.uid,
            receiverId: advisor.uid,
            content,
            conversationId: conversation._id,
        });

        void publishMessage({
            messageId: String(savedMessage._id),
            conversationId: String(conversation._id),
            senderId: auth.uid,
            senderName: auth.displayName,
            receiverId: advisor.uid,
            content,
            createdAt: savedMessage.createdAt instanceof Date ? savedMessage.createdAt : new Date(),
            participants: conversation.participants,
        });

        // Notify the advisor in-app + by email — same helper used elsewhere
        // for message notifications.
        void createNotification({
            userId: advisor.uid,
            type: 'message',
            title: 'New Support Request',
            message: `${auth.displayName}: ${subject}`,
            actionUrl: `/${advisorPortal}/communications`,
            sendEmail: true,
            userEmail: advisor.email,
            emailData: {
                recipientName: advisor.displayName,
                senderName: auth.displayName,
                messagePreview: message.length > 200 ? `${message.slice(0, 200)}…` : message,
                conversationUrl: `${getEmailUrl()}/${advisorPortal}/communications`,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Your request has been sent to the academic office. You will be notified by email when they reply.',
            conversationId: String(conversation._id),
        }, { status: 201 });
    } catch (err: any) {
        console.error('POST /api/support-requests failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
