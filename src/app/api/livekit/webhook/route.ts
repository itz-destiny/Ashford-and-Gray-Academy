import { NextResponse, type NextRequest } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import { getLiveKitConfig } from '@/lib/livekit';
import dbConnect from '@/lib/mongodb';
import MeetingLog from '@/models/MeetingLog';
import Recording from '@/models/Recording';

// LiveKit posts the raw JSON body and signs it via Authorization header.
// We must read the request as text and verify before parsing.
export const dynamic = 'force-dynamic';

function parseMetadata(metadata: string | undefined): { appRole?: string } {
    if (!metadata) return {};
    try {
        const obj = JSON.parse(metadata);
        return typeof obj === 'object' && obj ? obj : {};
    } catch {
        return {};
    }
}

export async function POST(req: NextRequest) {
    let receiver: WebhookReceiver;
    try {
        const { apiKey, apiSecret } = getLiveKitConfig();
        receiver = new WebhookReceiver(apiKey, apiSecret);
    } catch (err) {
        console.error('LiveKit webhook: server misconfigured.', err);
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const body = await req.text();
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';

    let event;
    try {
        event = await receiver.receive(body, authHeader);
    } catch (err) {
        console.warn('LiveKit webhook: signature verification failed.', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    try {
        await dbConnect();
        await handleEvent(event);
    } catch (err) {
        console.error('LiveKit webhook: failed to persist event', event.event, err);
        // Return 200 anyway so LiveKit doesn't retry — we've logged the failure.
    }

    return NextResponse.json({ received: true });
}

async function handleEvent(event: Awaited<ReturnType<WebhookReceiver['receive']>>) {
    // Egress events arrive with no `room` field — they carry `egressInfo`.
    if (event.event?.startsWith('egress_')) {
        await handleEgressEvent(event);
        return;
    }

    const roomName = event.room?.name;
    if (!roomName) return;

    switch (event.event) {
        case 'room_started': {
            await MeetingLog.findOneAndUpdate(
                { meetingId: roomName },
                {
                    $set: {
                        meetingId: roomName,
                        status: 'active',
                        startTime: new Date(),
                        metadata: { sid: event.room?.sid },
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            break;
        }

        case 'room_finished': {
            const log = await MeetingLog.findOne({ meetingId: roomName });
            if (!log) return;
            const endTime = new Date();
            const durationMinutes = log.startTime
                ? Math.max(0, Math.round((endTime.getTime() - log.startTime.getTime()) / 60000))
                : undefined;
            await MeetingLog.findByIdAndUpdate(log._id, {
                $set: { status: 'completed', endTime, durationMinutes },
            });
            break;
        }

        case 'participant_joined': {
            if (!event.participant) return;
            const meta = parseMetadata(event.participant.metadata);
            await MeetingLog.findOneAndUpdate(
                { meetingId: roomName },
                {
                    $addToSet: {
                        participants: {
                            uid: event.participant.identity,
                            displayName: event.participant.name || event.participant.identity,
                            role: meta.appRole || 'unknown',
                        },
                    },
                },
                { upsert: true }
            );
            break;
        }

        default:
            // Other events (track_published, etc.) intentionally ignored.
            break;
    }
}

async function handleEgressEvent(event: any) {
    const info = event.egressInfo;
    if (!info?.egressId) return;

    const status = String(info.status || '').toUpperCase();
    const fileResults = info.fileResults || [];
    const primary = fileResults[0];

    if (event.event === 'egress_started') {
        await Recording.findOneAndUpdate(
            { egressId: info.egressId },
            { $set: { status: 'active' } }
        );
        return;
    }

    if (event.event === 'egress_updated') {
        // Mid-recording progress event — no action needed unless we want to
        // expose live size/duration; keep the row in `active`.
        await Recording.findOneAndUpdate(
            { egressId: info.egressId },
            { $set: { status: 'active' } }
        );
        return;
    }

    if (event.event === 'egress_ended') {
        const completed =
            status === 'EGRESS_COMPLETE' ||
            status === 'EGRESS_ENDING' ||
            !!primary;

        const update: Record<string, unknown> = {
            status: completed ? 'complete' : (status === 'EGRESS_ABORTED' ? 'aborted' : 'failed'),
            endedAt: new Date(),
        };
        if (primary) {
            // primary.filename is the relative path inside the bucket
            update.storagePath = primary.filename;
            if (typeof primary.size !== 'undefined') update.fileSize = Number(primary.size);
            if (typeof primary.duration !== 'undefined') {
                update.durationSec = Math.round(Number(primary.duration) / 1_000_000_000);
            }
        }
        if (info.error) update.error = String(info.error);

        await Recording.findOneAndUpdate(
            { egressId: info.egressId },
            { $set: update }
        );
        return;
    }
}
