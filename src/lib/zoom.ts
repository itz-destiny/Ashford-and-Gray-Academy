import { readFile } from 'fs/promises';
import path from 'path';

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
                // Without this, whether a plain join link requires a Zoom
                // sign-in/account depends on the host account's own default —
                // which can be "authenticated users only." Students should
                // never need a Zoom account just to join a class link.
                meeting_authentication: false,
            }
        })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create Zoom meeting: ${errorText}`);
    }

    return await res.json();
}

// The start_url saved at scheduling time embeds a ZAK (Zoom Access Key) that
// goes stale after a while — clicking a stored one later gets "not the
// meeting owner, please sign in" instead of actually starting the class.
// Zoom re-signs a fresh ZAK on every GET of the meeting, so the fix is to
// never reuse a cached start_url: fetch a new one right when the host is
// about to start.
export async function getFreshZoomStartUrl(account: ZoomAccountCredentials, zoomMeetingId: string): Promise<string> {
    const token = await getZoomAccessToken(account);
    const res = await fetch(`https://api.zoom.us/v2/meetings/${encodeURIComponent(zoomMeetingId)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to refresh Zoom start URL: ${errorText}`);
    }
    const data = await res.json();
    if (!data.start_url) {
        throw new Error('Zoom did not return a start_url for this meeting.');
    }
    return data.start_url as string;
}

// Every licensed Zoom host is a shared, generic seat rotated across whichever
// instructor is teaching that time slot — never a per-instructor account. Left
// alone, a class would open showing that seat's own registered name (e.g. the
// school's Zoom account holder) as the host, not the instructor actually
// teaching. Renaming the seat's profile to the instructor's name right before
// each class is scheduled makes the in-meeting host name correct. Safe to
// call repeatedly: `findAvailableZoomHost` never double-books a seat for
// overlapping times, so a rename always belongs to whoever holds that seat
// next, and the account owner's own real identity is never actually changed.
export async function renameZoomHost(account: ZoomAccountCredentials, hostEmail: string, instructorName: string): Promise<void> {
    if (!hostEmail || hostEmail === 'me') return;
    const parts = instructorName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return;
    const first_name = parts[0];
    const last_name = parts.slice(1).join(' ') || parts[0];

    const token = await getZoomAccessToken(account);
    const res = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(hostEmail)}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name, last_name }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        // Never block scheduling the class over a cosmetic rename failure —
        // log it so an admin can fix the Zoom app's scope, but the class
        // still needs to go out under whatever name the seat currently has.
        console.warn(`Could not rename Zoom host ${hostEmail} to "${instructorName}": ${errorText}`);
    }
}

// Turns on the "Virtual Background" feature for a licensed host so they have
// backgrounds to pick from in-meeting. Zoom has no API to force a specific
// image into a specific meeting — the host still chooses one live from
// Zoom's own gallery (Video Settings > Background & Effects) — this only
// makes sure that gallery isn't greyed out/disabled for the seat.
export async function enableZoomVirtualBackground(account: ZoomAccountCredentials, hostEmail: string): Promise<void> {
    if (!hostEmail || hostEmail === 'me') return;

    const token = await getZoomAccessToken(account);
    const res = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(hostEmail)}/settings`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ in_meeting: { virtual_background: true } }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.warn(`Could not enable virtual backgrounds for ${hostEmail}: ${errorText}`);
    }
}

// Zoom shows the host seat's own profile picture in-meeting whenever their
// camera is off — for a shared seat that's a real person's real photo (e.g.
// the license owner), not the instructor teaching. There's no API to remove
// a profile picture outright, so this replaces it with the academy logo
// instead, the same way renameZoomHost replaces the name.
export async function setZoomHostPicture(account: ZoomAccountCredentials, hostEmail: string): Promise<void> {
    if (!hostEmail || hostEmail === 'me') return;

    try {
        const token = await getZoomAccessToken(account);
        const imageBuffer = await readFile(path.join(process.cwd(), 'public', 'icon.png'));
        const form = new FormData();
        form.append('pic_file', new Blob([imageBuffer], { type: 'image/png' }), 'academy-logo.png');

        const res = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(hostEmail)}/picture`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: form,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.warn(`Could not set Zoom host picture for ${hostEmail}: ${errorText}`);
        }
    } catch (err) {
        console.warn(`Could not set Zoom host picture for ${hostEmail}:`, err);
    }
}
