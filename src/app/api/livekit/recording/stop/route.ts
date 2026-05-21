import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { EgressClient } from 'livekit-server-sdk';
import dbConnect from '@/lib/mongodb';
import Recording from '@/models/Recording';
import Course from '@/models/Course';
import { withAuth, type AuthContext, AuthError } from '@/lib/auth-server';
import { getLiveKitConfig } from '@/lib/livekit';
import { RecordingError, getLiveKitHttpHost } from '@/lib/recording';

const bodySchema = z.object({
    egressId: z.string().min(1).optional(),
    room: z.string().min(1).optional(),
});

async function assertCanStop(recording: { roomName: string; startedBy: string }, auth: AuthContext): Promise<void> {
    if (auth.role === 'admin') return;
    if (recording.startedBy === auth.uid) return;
    if (auth.role === 'instructor' && recording.roomName.startsWith('course-')) {
        const courseId = recording.roomName.slice('course-'.length);
        await dbConnect();
        const course = await Course.findById(courseId).select('instructorUid instructor');
        const owns =
            (course?.instructorUid && course.instructorUid === auth.uid) ||
            (!course?.instructorUid && course?.instructor?.name === auth.displayName);
        if (owns) return;
    }
    throw new RecordingError(403, 'You cannot stop this recording.');
}

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success || (!parsed.data.egressId && !parsed.data.room)) {
        return NextResponse.json({ error: 'Provide egressId or room' }, { status: 400 });
    }

    try {
        await dbConnect();
        const recording = parsed.data.egressId
            ? await Recording.findOne({ egressId: parsed.data.egressId })
            : await Recording.findOne({
                  roomName: parsed.data.room,
                  status: { $in: ['starting', 'active'] },
              }).sort({ startedAt: -1 });

        if (!recording) {
            return NextResponse.json({ error: 'No active recording for that room' }, { status: 404 });
        }

        try {
            await assertCanStop(recording, auth);
        } catch (err) {
            if (err instanceof RecordingError) {
                return NextResponse.json({ error: err.message }, { status: err.status });
            }
            if (err instanceof AuthError) {
                return NextResponse.json({ error: err.message }, { status: err.status });
            }
            throw err;
        }

        const { apiKey, apiSecret } = getLiveKitConfig();
        const host = getLiveKitHttpHost();
        const egressClient = new EgressClient(host, apiKey, apiSecret);

        try {
            await egressClient.stopEgress(recording.egressId);
        } catch (err: any) {
            // If LiveKit says the egress already ended, that's fine — webhook
            // will reconcile the status. Otherwise re-throw.
            const message = err?.message || String(err);
            if (!/already (ended|stopped|completed)/i.test(message)) {
                console.error('stopEgress failed:', err);
            }
        }

        recording.status = 'ending';
        await recording.save();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (err instanceof RecordingError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('recording stop failed:', err);
        return NextResponse.json({ error: 'Failed to stop recording' }, { status: 500 });
    }
});
