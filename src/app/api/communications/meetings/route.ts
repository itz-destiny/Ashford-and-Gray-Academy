import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import MeetingLog from '@/models/MeetingLog';
import { withAuth, type AuthContext, type Role } from '@/lib/auth-server';

// Most meeting lifecycle is now captured by the LiveKit webhook
// (see /api/livekit/webhook). This endpoint remains for clients that want to
// read meeting history or manually record sessions in non-LiveKit flows.

const ELEVATED: readonly Role[] = ['admin', 'instructor'];

function canSeeMeeting(auth: AuthContext, log: { participants?: { uid: string }[] }): boolean {
    if (ELEVATED.includes(auth.role)) return true;
    const participants = log.participants ?? [];
    return participants.some(p => p.uid === auth.uid);
}

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');
        const meetingId = searchParams.get('meetingId');

        const query: Record<string, unknown> = {};
        if (conversationId) query.conversationId = conversationId;
        if (meetingId) query.meetingId = meetingId;

        const logs = await MeetingLog.find(query).sort({ startTime: -1 });
        const visible = logs.filter(log => canSeeMeeting(auth, log.toObject()));
        return NextResponse.json(visible);
    } catch (error: any) {
        console.error('GET /api/communications/meetings failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

const postSchema = z.object({
    meetingId: z.string().min(1),
    action: z.enum(['start', 'end']),
    conversationId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
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
        const { meetingId, action, conversationId, metadata } = parsed.data;

        if (action === 'start') {
            const log = await MeetingLog.create({
                meetingId,
                conversationId,
                startTime: new Date(),
                status: 'active',
                participants: [
                    {
                        uid: auth.uid,
                        displayName: auth.displayName,
                        role: auth.role,
                    },
                ],
                metadata,
            });
            return NextResponse.json(log, { status: 201 });
        }

        // 'end' — only the host (first participant) or an elevated role can end.
        const log = await MeetingLog.findOne({ meetingId });
        if (!log) return NextResponse.json({ error: 'Meeting log not found' }, { status: 404 });
        const host = log.participants?.[0]?.uid;
        if (host !== auth.uid && !ELEVATED.includes(auth.role)) {
            return NextResponse.json(
                { error: 'Only the host or an admin can end the meeting.' },
                { status: 403 }
            );
        }

        const endTime = new Date();
        const durationMinutes = log.startTime
            ? Math.max(0, Math.round((endTime.getTime() - log.startTime.getTime()) / 60000))
            : undefined;
        const updated = await MeetingLog.findOneAndUpdate(
            { meetingId },
            {
                status: 'completed',
                endTime,
                durationMinutes,
                ...(metadata ? { metadata } : {}),
            },
            { new: true }
        );
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('POST /api/communications/meetings failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
