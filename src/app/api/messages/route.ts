import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Message, Conversation } from '@/models/Supports';
import { withAuth, type AuthContext } from '@/lib/auth-server';
import { publishMessage } from '@/lib/realtime-events';

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

        if (conversationId) {
            const allowed = await userIsConversationParticipant(auth.uid, conversationId);
            if (!allowed) {
                return NextResponse.json(
                    { error: 'You are not a participant in this conversation.' },
                    { status: 403 }
                );
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
        });

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
