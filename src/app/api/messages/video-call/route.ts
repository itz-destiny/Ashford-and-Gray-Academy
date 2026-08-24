import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Conversation } from '@/models/Supports';
import { withAuth } from '@/lib/auth-server';
import { createZoomMeeting } from '@/lib/zoom';
import { findAvailableZoomHost } from '@/lib/zoom-scheduler';

const postSchema = z.object({
    conversationId: z.string().min(1),
});

// POST /api/messages/video-call
// Starts an instant 1:1 Zoom meeting for two people already in a
// conversation (Messages "Start Video Call" button). Not tied to a course,
// so nothing is persisted to LiveClass — this is an ephemeral ad-hoc call,
// same as the old LiveKit room it replaces.
export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    try {
        await dbConnect();

        const conversation = await Conversation.findById(parsed.data.conversationId)
            .select('participants')
            .lean<{ participants: string[] } | null>();
        if (!conversation || !conversation.participants.includes(auth.uid)) {
            return NextResponse.json({ error: 'You are not a participant in this conversation.' }, { status: 403 });
        }

        const startTime = new Date();
        const durationMinutes = 60;
        const assignment = await findAvailableZoomHost(startTime, durationMinutes);
        if (!assignment) {
            return NextResponse.json(
                { error: 'Every licensed Zoom host is currently busy. Please try again in a few minutes.' },
                { status: 409 }
            );
        }

        const zoomResponse = await createZoomMeeting({
            topic: `Video Call — ${auth.displayName}`,
            startTime: startTime.toISOString(),
            durationMinutes,
            hostEmail: assignment.hostEmail,
            account: assignment.account,
        });

        return NextResponse.json({ success: true, joinUrl: zoomResponse.join_url, startUrl: zoomResponse.start_url });
    } catch (error: any) {
        console.error('POST /api/messages/video-call failed:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
});
