import crypto from 'crypto';
import { getZoomAccessToken } from './zoom';
import { getZoomAccounts } from './zoom-hosts';

// Students join the live exam room with the ordinary Zoom join link (app or
// Zoom's own web client) — the embedded Meeting SDK join is refused by Zoom
// for this account ("No permission"). The site then confirms with Zoom's
// live-participant list that each student is actually in the room.

/** Short, stable per-student code added to their Zoom name so we can match them. */
export function studentRoomCode(uid: string): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const digest = crypto.createHash('sha256').update(`exam-room:${uid}`).digest();
    return Array.from(digest.subarray(0, 4)).map(b => alphabet[b % alphabet.length]).join('');
}

export function roomDisplayName(displayName: string, code: string): string {
    return `${(displayName || 'Student').trim()} [${code}]`;
}

/** The join link with the student's tagged name prefilled (`uname` is honoured by Zoom's join page and web client). */
export function studentJoinUrl(joinUrl: string, displayName: string, code: string): string {
    try {
        const u = new URL(joinUrl);
        u.searchParams.set('uname', roomDisplayName(displayName, code));
        return u.toString();
    } catch {
        return joinUrl;
    }
}

const STOP = new Set(['mr', 'mrs', 'miss', 'ms', 'dr', 'the', 'and']);
const tokens = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));

/**
 * Is this student in the room? Matches their code first (reliable), then —
 * for a student signed into the Zoom app, whose account name replaces the
 * prefilled one — at least two words of their name.
 */
export function isStudentInRoom(participantNames: string[], displayName: string, code: string): boolean {
    const codeRe = new RegExp(`\\b${code}\\b`, 'i');
    if (participantNames.some(n => codeRe.test(n))) return true;
    const want = tokens(displayName);
    if (want.length < 2) return false;
    return participantNames.some(n => {
        const have = new Set(tokens(n));
        return want.filter(w => have.has(w)).length >= 2;
    });
}

const cache = new Map<string, { at: number; names: string[] | null }>();
const CACHE_MS = 15_000;

/**
 * Names of everyone currently in the meeting, per Zoom's live dashboard.
 * Cached briefly so a whole class polling every 30s costs one Zoom call per
 * meeting per 15s. Returns null if Zoom can't be reached (callers must not
 * punish a student for that).
 */
export async function liveParticipantNames(meetingId: string, accountKey: string | undefined): Promise<string[] | null> {
    const hit = cache.get(meetingId);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.names;

    let names: string[] | null = null;
    try {
        const account = getZoomAccounts().find(a => a.key === accountKey) || getZoomAccounts()[0];
        const token = await getZoomAccessToken(account);
        names = [];
        let next = '';
        do {
            const res = await fetch(
                `https://api.zoom.us/v2/metrics/meetings/${encodeURIComponent(meetingId)}/participants?type=live&page_size=300${next ? `&next_page_token=${next}` : ''}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data: any = await res.json().catch(() => ({}));
            if (res.status === 404 || data?.code === 3001) break; // meeting not running yet: nobody is in it
            if (!res.ok) { names = null; break; }
            // Live metrics list each join; a participant who left has a leave_time.
            for (const p of data.participants || []) if (!p.leave_time) names.push(String(p.user_name || ''));
            next = data.next_page_token || '';
        } while (next);
    } catch {
        names = null;
    }
    cache.set(meetingId, { at: Date.now(), names });
    return names;
}
