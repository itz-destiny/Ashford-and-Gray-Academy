import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Message } from '@/models/Supports';
import { withAuth } from '@/lib/auth-server';

const bodySchema = z.object({
    conversationId: z.string().min(1),
});

// =============================================================================
// PATCH /api/messages/mark-read — marks every message addressed to the
// caller in one conversation as read. Nothing in the chat UI ever called the
// existing single-message PUT, so opening a conversation never actually
// cleared it from "unread" anywhere (dashboard previews, notification counts).
// =============================================================================
export const PATCH = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    try {
        await dbConnect();
        const result = await Message.updateMany(
            { conversationId: parsed.data.conversationId, receiverId: auth.uid, isRead: false },
            { $set: { isRead: true } }
        );
        return NextResponse.json({ success: true, updated: result.modifiedCount });
    } catch (error: any) {
        console.error('PATCH /api/messages/mark-read failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
