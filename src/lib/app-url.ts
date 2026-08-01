export function getRequestOrigin(req?: { headers: { get(name: string): string | null } | Headers }): string | undefined {
    const headers = req?.headers;
    if (!headers) return undefined;

    const forwardedProto = headers.get?.('x-forwarded-proto')?.split(',')[0]?.trim();
    const forwardedHost = headers.get?.('x-forwarded-host')?.split(',')[0]?.trim();
    const host = headers.get?.('host')?.trim();

    if (forwardedProto && forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
    }

    if (forwardedProto && host) {
        return `${forwardedProto}://${host}`;
    }

    return undefined;
}

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

const PUBLIC_SITE_URL = 'https://www.ashfordandgrayfusionacademy.com';

/**
 * The URL to use inside outbound emails specifically. `NEXT_PUBLIC_APP_URL`
 * is intentionally left as localhost in local dev (see .env.local) so
 * Paystack callbacks round-trip to a developer's machine — but a real
 * recipient's inbox must never show a `localhost` link regardless of where
 * the sending code happens to run. This always resolves to the real site.
 */
export function getEmailUrl(): string {
    const resolved = getAppUrl();
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/.test(resolved);
    return isLocalhost ? PUBLIC_SITE_URL : resolved;
}
