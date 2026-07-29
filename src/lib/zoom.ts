export async function getZoomAccessToken(): Promise<string> {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
        throw new Error('Zoom credentials are not fully configured in environment variables.');
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
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
    return data.access_token;
}

export interface CreateZoomMeetingParams {
    topic: string;
    agenda?: string;
    startTime: string; // ISO-8601 UTC format
    durationMinutes: number;
}

export async function createZoomMeeting(params: CreateZoomMeetingParams) {
    const token = await getZoomAccessToken();
    const zoomEmail = process.env.ZOOM_ACCOUNT_EMAIL || 'me';

    const res = await fetch(`https://api.zoom.us/v2/users/${zoomEmail}/meetings`, {
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
