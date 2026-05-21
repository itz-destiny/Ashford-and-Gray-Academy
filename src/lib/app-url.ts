/**
 * Canonical resolver for the public app URL used inside every transactional
 * email, signed token URL, and external redirect.
 *
 * In production, refuses to return a localhost URL — that's almost certainly
 * a misconfigured Vercel env var that would email subscribers links they
 * can't click. The function falls back to the request origin when available
 * (passed in) or raises so we fail loudly instead of silently sending broken
 * links.
 */
export function getAppUrl(opts?: { fallbackOrigin?: string }): string {
    const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
    const isProd = process.env.NODE_ENV === 'production';
    const isLocalhost = raw && /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/.test(raw);

    if (raw && !(isProd && isLocalhost)) {
        return raw.replace(/\/$/, '');
    }

    if (isProd && isLocalhost) {
        console.error(
            'getAppUrl: NEXT_PUBLIC_APP_URL is set to a localhost address in production. ' +
            'Outbound links would not work for users. Update the env var in Vercel.'
        );
    }

    if (opts?.fallbackOrigin) {
        return opts.fallbackOrigin.replace(/\/$/, '');
    }

    return (raw || 'http://localhost:9002').replace(/\/$/, '');
}
