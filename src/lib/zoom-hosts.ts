// Zoom is licensed per-account, and each account can hold several licensed
// "host" users. A single Server-to-Server OAuth app is scoped to ONE Zoom
// account, but can create a meeting under any licensed user in that account
// (POST /v2/users/{email}/meetings). So the school's real capacity is the
// sum, across every configured account, of (licensed hosts × meetings each
// license can run at once).
//
// Configure one block of env vars per Zoom account:
//
//   ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET / ZOOM_ACCOUNT_EMAIL
//     — the original account. ZOOM_ACCOUNT_EMAIL is a single host email
//     (defaults to "me" — the account owner — if unset).
//
//   ZOOM_SCHOOL_ACCOUNT_ID / ZOOM_SCHOOL_CLIENT_ID / ZOOM_SCHOOL_CLIENT_SECRET
//   ZOOM_SCHOOL_HOST_EMAILS
//     — the new business account. ZOOM_SCHOOL_HOST_EMAILS is a comma-
//     separated list of every licensed user's email on that account, e.g.
//     "host1@academy.com,host2@academy.com,host3@academy.com".
//
//   ZOOM_PRIMARY_CONCURRENCY / ZOOM_SCHOOL_CONCURRENCY (optional, default 1)
//     — set to 2 only if that account's licenses have Zoom's paid
//     "Concurrent Meeting" add-on (each license can then run 2 meetings at
//     once instead of 1). Confirm this in the Zoom admin billing page
//     before changing it — assume 1 until it's actually confirmed there.
//
// An account with no host emails configured is simply skipped, so this is
// safe to leave partially filled in during setup.

export interface ZoomHostAccount {
    key: string;
    accountId: string;
    clientId: string;
    clientSecret: string;
    hosts: string[];
    concurrencyPerHost: number;
}

function parseHostList(raw: string | undefined): string[] {
    return (raw || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function parseConcurrency(raw: string | undefined): number {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function getZoomAccounts(): ZoomHostAccount[] {
    const accounts: ZoomHostAccount[] = [];

    if (process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET) {
        accounts.push({
            key: 'primary',
            accountId: process.env.ZOOM_ACCOUNT_ID,
            clientId: process.env.ZOOM_CLIENT_ID,
            clientSecret: process.env.ZOOM_CLIENT_SECRET,
            hosts: [process.env.ZOOM_ACCOUNT_EMAIL?.trim() || 'me'],
            concurrencyPerHost: parseConcurrency(process.env.ZOOM_PRIMARY_CONCURRENCY),
        });
    }

    if (process.env.ZOOM_SCHOOL_ACCOUNT_ID && process.env.ZOOM_SCHOOL_CLIENT_ID && process.env.ZOOM_SCHOOL_CLIENT_SECRET) {
        const hosts = parseHostList(process.env.ZOOM_SCHOOL_HOST_EMAILS);
        if (hosts.length > 0) {
            accounts.push({
                key: 'school',
                accountId: process.env.ZOOM_SCHOOL_ACCOUNT_ID,
                clientId: process.env.ZOOM_SCHOOL_CLIENT_ID,
                clientSecret: process.env.ZOOM_SCHOOL_CLIENT_SECRET,
                hosts,
                concurrencyPerHost: parseConcurrency(process.env.ZOOM_SCHOOL_CONCURRENCY),
            });
        }
    }

    return accounts;
}

// Total simultaneous live classes the platform can currently run, summed
// across every configured account and license.
export function totalZoomCapacity(): number {
    return getZoomAccounts().reduce((sum, a) => sum + a.hosts.length * a.concurrencyPerHost, 0);
}
