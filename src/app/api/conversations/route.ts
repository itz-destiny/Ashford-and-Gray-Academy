import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Conversation } from '@/models/Supports';
import User from '@/models/User';
import { withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();
        const conversations = await Conversation.find({ participants: auth.uid }).sort({
            lastMessageAt: -1,
        });
        return NextResponse.json(conversations);
    } catch (error: any) {
        console.error('GET /api/conversations failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

const postSchema = z.object({
    participants: z.array(z.string().min(1)).min(1).max(20),
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
        // Always include the authenticated user in the conversation; dedupe.
        const participants = Array.from(new Set([auth.uid, ...parsed.data.participants]));

        // An instructor may only open a direct conversation with a student —
        // never another instructor or an admin/registrar/finance/admissions
        // office. Cohort enrollment itself is enforced when a message is
        // actually sent (POST /api/messages).
        if (auth.role === 'instructor' && participants.length === 2) {
            const otherUid = participants.find((p) => p !== auth.uid);
            const other = await User.findOne({ uid: otherUid }).select('role').lean<{ role: string } | null>();
            if (other?.role !== 'student') {
                return NextResponse.json(
                    { error: 'Instructors can only message students in their own cohort.' },
                    { status: 403 }
                );
            }
        }

        const existing = await Conversation.findOne({
            participants: { $all: participants, $size: participants.length },
        });
        if (existing) return NextResponse.json(existing);

        const conversation = await Conversation.create({
            participants,
            lastMessage: 'Started a new conversation',
            lastMessageAt: new Date(),
        });
        return NextResponse.json(conversation, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/conversations failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
