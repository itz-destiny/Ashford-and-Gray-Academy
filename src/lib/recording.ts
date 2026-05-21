/**
 * Helpers for live-class recording via LiveKit Egress → Firebase Storage.
 *
 * Firebase Storage buckets are GCS buckets under the hood, so we use
 * LiveKit's GCP egress upload destination and feed it the same service
 * account credentials the Firebase Admin SDK uses.
 */

export class RecordingError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'RecordingError';
    }
}

/**
 * Build the JSON string LiveKit needs in GCPUpload.credentials.
 * Throws if any of the three FIREBASE_ADMIN_* env vars are missing.
 */
export function gcsCredentialsJson(env: NodeJS.ProcessEnv = process.env): string {
    const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const rawKey = env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawKey) {
        throw new RecordingError(
            500,
            'Recording is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY.'
        );
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');
    return JSON.stringify({
        type: 'service_account',
        project_id: projectId,
        private_key: privateKey,
        client_email: clientEmail,
        token_uri: 'https://oauth2.googleapis.com/token',
    });
}

export function getStorageBucket(env: NodeJS.ProcessEnv = process.env): string {
    const bucket = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucket) {
        throw new RecordingError(500, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set.');
    }
    return bucket;
}

/**
 * Resolve the LiveKit Egress host from the configured WS URL. EgressClient
 * needs an HTTPS endpoint, e.g. https://my-project.livekit.cloud
 */
export function getLiveKitHttpHost(env: NodeJS.ProcessEnv = process.env): string {
    const wsUrl = env.LIVEKIT_WS_URL;
    if (!wsUrl) throw new RecordingError(500, 'LIVEKIT_WS_URL is not set.');
    return wsUrl.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
}

/**
 * Compute the storage path LiveKit will write the recording to.
 * Pattern: recordings/<courseId or roomName>/<isoDate>-<egressId>.mp4
 *
 * LiveKit substitutes `{room_name}` and `{time}` at upload time — we keep
 * our own slug so a known prefix is always queryable.
 */
export function buildRecordingPath(opts: { roomName: string; courseId?: string }): string {
    const slug = (opts.courseId || opts.roomName).replace(/[^a-zA-Z0-9_-]/g, '_');
    return `recordings/${slug}/${'{time}'}-{room_name}.mp4`;
}
