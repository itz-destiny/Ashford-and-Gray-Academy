import LiveClass from '@/models/LiveClass';
import { getZoomAccounts, type ZoomHostAccount } from './zoom-hosts';

export interface ZoomHostAssignment {
    account: ZoomHostAccount;
    hostEmail: string;
}

interface ScheduledLiveClass {
    startTime: Date;
    durationMinutes: number;
    zoomHostEmail?: string;
    zoomAccountKey?: string;
}

// Picks the first licensed Zoom host, across every configured account, that
// isn't already booked for an overlapping time window. Returns null when
// every license is busy — callers must treat that as "no capacity," never
// silently double-book a host (Zoom itself would let you try to create a
// second concurrent meeting on a single-meeting license, but the meeting
// would fail to actually start for the second host).
export async function findAvailableZoomHost(startTime: Date, durationMinutes: number): Promise<ZoomHostAssignment | null> {
    const accounts = getZoomAccounts();
    if (accounts.length === 0) return null;

    const newStart = startTime.getTime();
    const newEnd = newStart + durationMinutes * 60_000;

    const scheduled = await LiveClass.find({ status: 'scheduled', zoomHostEmail: { $exists: true, $ne: null } })
        .select('startTime durationMinutes zoomHostEmail zoomAccountKey')
        .lean<ScheduledLiveClass[]>();

    const busyCount = new Map<string, number>();
    for (const c of scheduled) {
        if (!c.zoomHostEmail) continue;
        const s = new Date(c.startTime).getTime();
        const e = s + (c.durationMinutes || 60) * 60_000;
        if (s < newEnd && e > newStart) {
            const key = `${c.zoomAccountKey}:${c.zoomHostEmail}`;
            busyCount.set(key, (busyCount.get(key) || 0) + 1);
        }
    }

    for (const account of accounts) {
        for (const hostEmail of account.hosts) {
            const key = `${account.key}:${hostEmail}`;
            const busy = busyCount.get(key) || 0;
            if (busy < account.concurrencyPerHost) {
                return { account, hostEmail };
            }
        }
    }

    return null;
}
