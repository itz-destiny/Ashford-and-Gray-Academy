import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Conversation } from '@/models/Supports';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const conversations = await Conversation.find({
            participants: userId
        }).sort({ lastMessageAt: -1 });

        return NextResponse.json(conversations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { participants } = body;

        // Check if conversation already exists
        const existing = await Conversation.findOne({
            participants: { $all: participants, $size: participants.length }
        });

        if (existing) {
            return NextResponse.json(existing);
        }

        const conversation = await Conversation.create({
            participants,
            lastMessage: 'Started a new conversation',
            lastMessageAt: new Date()
        });

        return NextResponse.json(conversation);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
