import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Message } from '@/models/Supports';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // Current user
        const contactId = searchParams.get('contactId'); // Person they are chatting with
        const courseId = searchParams.get('courseId');

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
        const message = await Message.create(body);
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
