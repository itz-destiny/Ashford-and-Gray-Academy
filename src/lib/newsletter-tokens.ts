import { createHash } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';

/**
 * Newsletter link tokens — signed JWTs used in confirmation and unsubscribe
 * URLs that we email to subscribers.
 *
 * Secret:
 *   `NEWSLETTER_TOKEN_SECRET` is the proper production value. If unset, we
 *   derive a stable secret from MONGODB_URI so dev still works without a
 *   manual env var — but we log a warning. Never rely on the fallback in
 *   production: rotating the Mongo URI would invalidate every outstanding
 *   unsubscribe link a subscriber has been emailed.
 */

export type NewsletterTokenPurpose = 'confirm' | 'unsubscribe';

export type NewsletterTokenPayload = {
    purpose: NewsletterTokenPurpose;
    email: string;
};

class NewsletterTokenError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'NewsletterTokenError';
    }
}

export { NewsletterTokenError };

let warned = false;
function getSecret(): string {
    const explicit = process.env.NEWSLETTER_TOKEN_SECRET;
    if (explicit && explicit.length >= 16) return explicit;
    const mongo = process.env.MONGODB_URI;
    if (!mongo) {
        throw new NewsletterTokenError(
            500,
            'Token signing not configured. Set NEWSLETTER_TOKEN_SECRET.'
        );
    }
    if (!warned && process.env.NODE_ENV === 'production') {
        console.warn(
            'newsletter-tokens: NEWSLETTER_TOKEN_SECRET not set. ' +
            'Using a derived fallback — set a real secret in production.'
        );
        warned = true;
    }
    return createHash('sha256').update(`newsletter|${mongo}`).digest('hex');
}

const CONFIRM_TTL: SignOptions['expiresIn'] = '7d';
// Unsubscribe links must work forever — a subscriber from year one needs to
// be able to opt out year five. No expiry on these.
const UNSUBSCRIBE_TTL: SignOptions['expiresIn'] = undefined as unknown as SignOptions['expiresIn'];

export function signNewsletterToken(payload: NewsletterTokenPayload): string {
    const opts: SignOptions = { algorithm: 'HS256' };
    if (payload.purpose === 'confirm') opts.expiresIn = CONFIRM_TTL;
    return jwt.sign({ p: payload.purpose, e: payload.email.toLowerCase() }, getSecret(), opts);
}

export function verifyNewsletterToken(
    token: string,
    expected: NewsletterTokenPurpose
): NewsletterTokenPayload {
    let decoded: any;
    try {
        decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
    } catch (err: any) {
        if (err?.name === 'TokenExpiredError') {
            throw new NewsletterTokenError(410, 'This link has expired. Please request a new one.');
        }
        throw new NewsletterTokenError(400, 'Invalid or tampered link.');
    }
    if (typeof decoded !== 'object' || !decoded) {
        throw new NewsletterTokenError(400, 'Invalid token payload.');
    }
    if (decoded.p !== expected) {
        throw new NewsletterTokenError(400, 'This link is not valid for this action.');
    }
    if (typeof decoded.e !== 'string' || !decoded.e.includes('@')) {
        throw new NewsletterTokenError(400, 'Invalid token email.');
    }
    return { purpose: decoded.p, email: decoded.e };
}

export function buildConfirmUrl(email: string): string {
    const { getAppUrl } = require('./app-url') as typeof import('./app-url');
    const appUrl = getAppUrl();
    const token = signNewsletterToken({ purpose: 'confirm', email });
    return `${appUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

export function buildUnsubscribeUrl(email: string): string {
    const { getAppUrl } = require('./app-url') as typeof import('./app-url');
    const appUrl = getAppUrl();
    const token = signNewsletterToken({ purpose: 'unsubscribe', email });
    return `${appUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
