import LiveClass, { type ILiveClass } from '@/models/LiveClass';
import { getZoomAccounts } from './zoom-hosts';

// A "monitor slot" is one seat of the school's real concurrent Zoom capacity
// (accounts × licensed hosts × concurrency-per-host), numbered 1..N in a
// stable order. Each dedicated monitor account (role:'live_monitor') is
// permanently bound to one slot number and always watches whatever class is
// currently live in it — never anything else. The slot list is derived live
// from getZoomAccounts(), so it grows automatically (today: whatever is
// configured; the target: 8, once all 4 licenses' host emails are set) with
// no code change needed.

export interface MonitorSlot {
    slotNumber: number;       // 1-based, stable given a fixed account/host order
    accountKey: string;
    hostEmail: string;
    indexOnHost: number;      // 0-based position among this host's concurrent slots
}

export function getMonitorSlots(): MonitorSlot[] {
    const slots: MonitorSlot[] = [];
    let n = 1;
    for (const account of getZoomAccounts()) {
        for (const hostEmail of account.hosts) {
            for (let indexOnHost = 0; indexOnHost < account.concurrencyPerHost; indexOnHost++) {
                slots.push({ slotNumber: n++, accountKey: account.key, hostEmail, indexOnHost });
            }
        }
    }
    return slots;
}

export function totalMonitorSlots(): number {
    return getMonitorSlots().length;
}

function isCurrentlyLive(liveClass: Pick<ILiveClass, 'startTime' | 'durationMinutes'>, now: number): boolean {
    const start = new Date(liveClass.startTime).getTime();
    const end = start + (liveClass.durationMinutes || 60) * 60_000;
    return now >= start && now <= end;
}

/**
 * The class currently live in a given slot, or null if that slot is idle
 * right now. When a host's concurrency is >1 and more than one of its
 * meetings happen to be live at once, they're ordered by startTime so each
 * global slot number consistently maps to the same one.
 */
export async function getCurrentClassForSlot(slotNumber: number): Promise<
    (ILiveClass & { courseTitle?: string }) | null
> {
    const slot = getMonitorSlots().find((s) => s.slotNumber === slotNumber);
    if (!slot) return null;

    const now = Date.now();
    const candidates = await LiveClass.find({
        status: 'scheduled',
        zoomAccountKey: slot.accountKey,
        zoomHostEmail: slot.hostEmail,
    }).sort({ startTime: 1, _id: 1 });

    const live = candidates.filter((c) => isCurrentlyLive(c, now));
    return live[slot.indexOnHost] || null;
}
