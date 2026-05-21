import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { EgressClient, EncodedFileType, type EncodedFileOutput } from 'livekit-server-sdk';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Recording from '@/models/Recording';
import { withAuth, type AuthContext, AuthError } from '@/lib/auth-server';
import { getLiveKitConfig } from '@/lib/livekit';
import {
    RecordingError,
    buildRecordingPath,
    gcsCredentialsJson,
    getLiveKitHttpHost,
    getStorageBucket,
} from '@/lib/recording';

const bodySchema = z.object({
    room: z.string().min(1).max(200),
});

async function assertCanRecord(roomName: string, auth: AuthContext): Promise<{ courseId?: string }> {
    if (auth.role === 'admin') return {};
    if (!roomName.startsWith('course-')) {
        throw new RecordingError(403, 'Recording is only allowed in course rooms.');
    }
    if (auth.role !== 'instructor') {
        throw new RecordingError(403, 'Only the course instructor or an admin can record.');
    }
    const courseId = roomName.slice('course-'.length);
    await dbConnect();
    const course = await Course.findById(courseId).select('instructorUid instructor');
    if (!course) throw new RecordingError(404, 'Course not found.');
    const owns =
        (course.instructorUid && course.instructorUid === auth.uid) ||
        (!course.instructorUid && course.instructor?.name === auth.displayName);
    if (!owns) throw new RecordingError(403, 'Only the course owner can record this class.');
    return { courseId };
}

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    let ctx: { courseId?: string };
    try {
        ctx = await assertCanRecord(parsed.data.room, auth);
    } catch (err) {
        if (err instanceof RecordingError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();

        // Avoid starting a second recording for a room that already has one
        // in-flight — LiveKit will accept it but we'd be paying for two.
        const inflight = await Recording.findOne({
            roomName: parsed.data.room,
            status: { $in: ['starting', 'active'] },
        });
        if (inflight) {
            return NextResponse.json({
                success: true,
                already: true,
                egressId: inflight.egressId,
            });
        }

        const { apiKey, apiSecret } = getLiveKitConfig();
        const host = getLiveKitHttpHost();
        const bucket = getStorageBucket();
        const credentials = gcsCredentialsJson();

        const file: EncodedFileOutput = {
            fileType: EncodedFileType.MP4,
            filepath: buildRecordingPath({ roomName: parsed.data.room, courseId: ctx.courseId }),
            gcp: { credentials, bucket } as any,
            output: { case: 'gcp', value: { credentials, bucket } } as any,
        };

        const egressClient = new EgressClient(host, apiKey, apiSecret);
        const egressInfo = await egressClient.startRoomCompositeEgress(parsed.data.room, {
            file,
        });

        const recording = await Recording.create({
            egressId: egressInfo.egressId,
            roomName: parsed.data.room,
            courseId: ctx.courseId,
            startedBy: auth.uid,
            startedByName: auth.displayName,
            status: 'starting',
            startedAt: new Date(),
            storagePath: undefined, // filled in by webhook on completion
        });

        return NextResponse.json({
            success: true,
            egressId: egressInfo.egressId,
            recordingId: recording._id.toString(),
        });
    } catch (err: any) {
        if (err instanceof RecordingError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('recording start failed:', err);
        return NextResponse.json(
            { error: err?.message || 'Failed to start recording' },
            { status: 500 }
        );
    }
});
