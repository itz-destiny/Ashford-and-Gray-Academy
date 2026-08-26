import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Message, Conversation } from '@/models/Supports';
import User from '@/models/User';
import { withAuth, type AuthContext } from '@/lib/auth-server';
import { publishMessage } from '@/lib/realtime-events';
import { canStudentMessageInstructor } from '@/lib/messaging-access';
import { createNotification } from '@/lib/notifications';
import { getEmailUrl } from '@/lib/app-url';

const ELEVATED_ROLES = ['admin'] as const;

function isElevated(auth: AuthContext): boolean {
    return (ELEVATED_ROLES as readonly string[]).includes(auth.role);
}

async function userIsConversationParticipant(uid: string, conversationId: string): Promise<boolean> {
    const convo = await Conversation.findById(conversationId)
        .select('participants')
        .lean<{ participants: string[] } | null>();
    if (!convo) return false;
    return convo.participants.includes(uid);
}

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');
    const courseId = searchParams.get('courseId');
    const conversationId = searchParams.get('conversationId');

    try {
        await dbConnect();

        if (conversationId) {
            const allowed = isElevated(auth) || await userIsConversationParticipant(auth.uid, conversationId);
            if (!allowed) {
                return NextResponse.json(
                    { error: 'You are not a participant in this conversation.' },
                    { status: 403 }
                );
            }
            const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
            return NextResponse.json(messages);
        }

        // Inbox view (no contactId): every message involving the user.
        // With contactId: only direct messages between auth.uid and contactId.
        const query: Record<string, unknown> = contactId
            ? {
                  $or: [
                      { senderId: auth.uid, receiverId: contactId },
                      { senderId: contactId, receiverId: auth.uid },
                  ],
              }
            : { $or: [{ senderId: auth.uid }, { receiverId: auth.uid }] };
        if (courseId) query.courseId = courseId;

        const messages = await Message.find(query).sort({ createdAt: 1 });
        return NextResponse.json(messages);
    } catch (error: any) {
        console.error('GET /api/messages failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

const postSchema = z.object({
    receiverId: z.string().min(1),
    content: z.string().min(1).max(5000),
    conversationId: z.string().optional(),
    courseId: z.string().optional(),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const { receiverId, content, conversationId, courseId } = parsed.data;

        let conversation: { participants: string[]; type?: string; kind?: string } | null = null;
        if (conversationId) {
            conversation = await Conversation.findById(conversationId).select('participants type kind').lean<{ participants: string[]; type?: string; kind?: string } | null>();
            if (!conversation || !conversation.participants.includes(auth.uid)) {
                return NextResponse.json(
                    { error: 'You are not a participant in this conversation.' },
                    { status: 403 }
                );
            }
        }

        // A student may only message an instructor while actively enrolled in
        // one of their courses, and only until that course's stated duration
        // has elapsed — this applies in both directions. An instructor may
        // never message anyone but a student in their own cohort — no other
        // instructors, no admin/registrar/finance/admissions offices. Group
        // (class) conversations are gated purely by conversation membership
        // above.
        if (conversation?.type !== 'group' && (auth.role === 'student' || auth.role === 'instructor')) {
            const receiver = await User.findOne({ uid: receiverId }).select('role').lean<{ role: string } | null>();
            const otherRole = receiver?.role;

            if (auth.role === 'instructor' && otherRole !== 'student') {
                return NextResponse.json(
                    { error: 'Instructors can only message students in their own cohort.' },
                    { status: 403 }
                );
            }

            const isStudentInstructorPair =
                (auth.role === 'student' && otherRole === 'instructor') ||
                (auth.role === 'instructor' && otherRole === 'student');

            if (isStudentInstructorPair) {
                const studentUid = auth.role === 'student' ? auth.uid : receiverId;
                const instructorUid = auth.role === 'instructor' ? auth.uid : receiverId;
                const allowed = await canStudentMessageInstructor(studentUid, instructorUid);
                if (!allowed) {
                    return NextResponse.json(
                        { error: 'This conversation is closed — messaging is only available while actively enrolled in the course.' },
                        { status: 403 }
                    );
                }
            }
        }

        // senderId is always the authenticated user. Client-supplied senderId
        // is ignored to prevent impersonation.
        const message = await Message.create({
            senderId: auth.uid,
            receiverId,
            content,
            conversationId,
            courseId,
        });

        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: content,
                lastMessageAt: new Date(),
            });
        }

        // Push to Firestore so any subscribed clients see the message
        // immediately, without polling. Fire-and-forget.
        void publishMessage({
            messageId: String(message._id),
            conversationId,
            senderId: auth.uid,
            senderName: auth.displayName,
            receiverId,
            content,
            courseId,
            createdAt: message.createdAt instanceof Date ? message.createdAt : new Date(),
            participants: conversation?.participants,
        });

        // Support-request thread: when the advisor (anyone other than the
        // student) replies, email the student so they know to check back —
        // they have no reason to be polling the dashboard otherwise.
        if (conversation?.kind === 'support' && auth.role !== 'student') {
            const student = await User.findOne({ uid: receiverId }).select('uid email displayName').lean<{ uid: string; email: string; displayName: string } | null>();
            if (student) {
                void createNotification({
                    userId: student.uid,
                    type: 'message',
                    title: 'Your Support Request Has a Reply',
                    message: `${auth.displayName} replied to your request.`,
                    actionUrl: '/communications',
                    sendEmail: true,
                    userEmail: student.email,
                    emailData: {
                        recipientName: student.displayName,
                        senderName: auth.displayName,
                        messagePreview: content.length > 200 ? `${content.slice(0, 200)}…` : content,
                        conversationUrl: `${getEmailUrl()}/communications`,
                    },
                });
            }
        }

        return NextResponse.json(message, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/messages failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

const putSchema = z.object({
    isRead: z.boolean(),
});

export const PUT = withAuth(async (req: NextRequest, { auth }) => {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('id');
    if (!messageId) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const json = await req.json().catch(() => null);
    const parsed = putSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const message = await Message.findById(messageId);
        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        // Only the receiver may mark a message as read.
        if (message.receiverId !== auth.uid && !isElevated(auth)) {
            return NextResponse.json(
                { error: 'You can only update messages addressed to you.' },
                { status: 403 }
            );
        }

        message.isRead = parsed.data.isRead;
        await message.save();
        return NextResponse.json(message);
    } catch (error: any) {
        console.error('PUT /api/messages failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
