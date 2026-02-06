import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Conversation, User } from '@/models/Supports'; // Ensure User is imported if used, otherwise remove
// Actually User model is in User.ts, let's just use Conversation for now and fetch User details from client or separate generic API
// But we need to populated participant details? 
// For now, let's just return the conversation with participant IDs, and let client fetch details 
// OR we can aggregate if we have a User model in the same DB. 
// The current User model is in src/models/User.ts (based on file list). Let's check imports.
// Supports.ts does not export User.

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
