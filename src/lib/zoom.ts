export interface ZoomAccountCredentials {
    accountId: string;
    clientId: string;
    clientSecret: string;
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export async function getZoomAccessToken(account: ZoomAccountCredentials): Promise<string> {
    if (!account?.accountId || !account?.clientId || !account?.clientSecret) {
        throw new Error('Zoom credentials are not fully configured in environment variables.');
    }

    const cached = tokenCache.get(account.accountId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.token;
    }

    const authHeader = Buffer.from(`${account.clientId}:${account.clientSecret}`).toString('base64');

    const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${account.accountId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to get Zoom access token: ${errorText}`);
    }

    const data = await res.json();
    // Cache a little under the real TTL so we never hand out a token that
    // expires mid-request.
    const ttlMs = Math.max(0, ((data.expires_in ?? 3600) - 60)) * 1000;
    tokenCache.set(account.accountId, { token: data.access_token, expiresAt: Date.now() + ttlMs });
    return data.access_token;
}

export interface CreateZoomMeetingParams {
    topic: string;
    agenda?: string;
    startTime: string; // ISO-8601 UTC format
    durationMinutes: number;
    // Which licensed user this meeting is created under. Defaults to the
    // Zoom account owner ("me") if not given.
    hostEmail?: string;
    account: ZoomAccountCredentials;
}

export async function createZoomMeeting(params: CreateZoomMeetingParams) {
    const token = await getZoomAccessToken(params.account);
    const hostEmail = params.hostEmail?.trim() || 'me';

    const res = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(hostEmail)}/meetings`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic: params.topic,
            type: 2, // 2 = Scheduled meeting
            start_time: params.startTime,
            duration: params.durationMinutes,
            agenda: params.agenda,
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                waiting_room: true,
                approval_type: 2, // No registration required
            }
        })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create Zoom meeting: ${errorText}`);
    }

    return await res.json();
}
