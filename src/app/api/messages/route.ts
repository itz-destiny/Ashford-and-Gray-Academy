import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Message } from '@/models/Supports';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const contactId = searchParams.get('contactId');
        const courseId = searchParams.get('courseId');
        const conversationId = searchParams.get('conversationId');

        if (conversationId) {
            const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
            return NextResponse.json(messages);
        }

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const query: any = {
            $or: [
                { senderId: userId, receiverId: contactId },
                { senderId: contactId, receiverId: userId }
            ]
        };

        if (courseId) {
            query.courseId = courseId;
        }

        const messages = await Message.find(query).sort({ createdAt: 1 });
        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // If conversationId is provided, use it. If not, try to find or create one (optional optimization)
        // For now, assume client might pass existing conversationId or we just save the message.

        const message = await Message.create(body);

        // Update conversation if linked
        if (body.conversationId) {
            await import('@/models/Supports').then(mod => mod.Conversation.findByIdAndUpdate(body.conversationId, {
                lastMessage: body.content,
                lastMessageAt: new Date()
            }));
        }

        return NextResponse.json(message);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const messageId = searchParams.get('id');
        const { isRead } = await request.json();

        const updated = await Message.findByIdAndUpdate(messageId, { isRead }, { new: true });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
