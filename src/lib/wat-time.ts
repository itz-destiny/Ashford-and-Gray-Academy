// Africa/Lagos (WAT) is UTC+1 year-round — no DST to account for.
export const WAT_OFFSET_MS = 60 * 60 * 1000;

/**
 * Midnight-to-midnight bounds of a given WAT calendar day, expressed as UTC
 * instants — for querying records stored in UTC by "which WAT day they fall
 * on." Pass a `YYYY-MM-DD` string to get a specific day; omit it for today.
 */
export function watDayBoundsUtc(dateStr?: string): { start: Date; end: Date } {
    let year: number, month: number, day: number;
    if (dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        year = y; month = m - 1; day = d;
    } else {
        const nowWat = new Date(Date.now() + WAT_OFFSET_MS);
        year = nowWat.getUTCFullYear(); month = nowWat.getUTCMonth(); day = nowWat.getUTCDate();
    }
    const watMidnightUtcInstant = Date.UTC(year, month, day);
    const start = new Date(watMidnightUtcInstant - WAT_OFFSET_MS);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
}

/** Today's date as a `YYYY-MM-DD` string in WAT. */
export function todayWatDateStr(): string {
    const nowWat = new Date(Date.now() + WAT_OFFSET_MS);
    const y = nowWat.getUTCFullYear();
    const m = String(nowWat.getUTCMonth() + 1).padStart(2, '0');
    const d = String(nowWat.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
