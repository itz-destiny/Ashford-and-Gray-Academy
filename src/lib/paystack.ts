import { createHmac, timingSafeEqual } from 'node:crypto';

const PAYSTACK_API = 'https://api.paystack.co';

type EnvLike = Record<string, string | undefined>;

export type PaystackConfig = {
    secretKey: string;
    publicKey: string | undefined;
    callbackUrl: string;
};

export class PaystackError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'PaystackError';
    }
}

export function getPaystackConfig(
    env: EnvLike = process.env,
    opts?: { fallbackOrigin?: string }
): PaystackConfig {
    const secretKey = env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        throw new Error(
            'Paystack is not configured. Set PAYSTACK_SECRET_KEY (and optionally NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY).'
        );
    }

    const rawAppUrl = env.NEXT_PUBLIC_APP_URL?.trim();
    const fallbackOrigin = opts?.fallbackOrigin?.trim();
    const isProd = env.NODE_ENV === 'production';
    const isLocalhost = rawAppUrl && /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/.test(rawAppUrl);

    const baseUrl = rawAppUrl && !(isProd && isLocalhost)
        ? rawAppUrl
        : fallbackOrigin || rawAppUrl || 'http://localhost:9002';

    return {
        secretKey,
        publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        callbackUrl: `${baseUrl.replace(/\/$/, '')}/payments/callback`,
    };
}

export type InitializeInput = {
    email: string;
    amountKobo: number;          // Paystack expects amount in subunits (kobo).
    currency?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
    callbackUrl?: string;
};

export type InitializeResponse = {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
};

export type VerifyResponse = {
    status: 'success' | 'failed' | 'abandoned' | 'reversed' | string;
    reference: string;
    amount: number;              // kobo
    currency: string;
    customer: { email: string };
    metadata: Record<string, unknown> | null;
    paidAt: string | null;
    channel: string | null;
};

export async function initializeTransaction(
    input: InitializeInput,
    config: PaystackConfig = getPaystackConfig()
): Promise<InitializeResponse> {
    const body = {
        email: input.email,
        amount: input.amountKobo,
        currency: input.currency ?? 'NGN',
        reference: input.reference,
        callback_url: input.callbackUrl ?? config.callbackUrl,
        metadata: input.metadata,
    };

    const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.secretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
    });

    const json = await res.json().catch(() => null) as
        | { status: boolean; message?: string; data?: { authorization_url: string; access_code: string; reference: string } }
        | null;

    if (!res.ok || !json?.status || !json.data) {
        throw new PaystackError(res.status || 502, json?.message || 'Paystack initialize failed');
    }
    return {
        authorizationUrl: json.data.authorization_url,
        accessCode: json.data.access_code,
        reference: json.data.reference,
    };
}

export async function verifyTransaction(
    reference: string,
    config: PaystackConfig = getPaystackConfig()
): Promise<VerifyResponse> {
    const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
            Authorization: `Bearer ${config.secretKey}`,
        },
        cache: 'no-store',
    });

    const json = await res.json().catch(() => null) as
        | { status: boolean; message?: string; data?: any }
        | null;

    if (!res.ok || !json?.status || !json.data) {
        throw new PaystackError(res.status || 502, json?.message || 'Paystack verify failed');
    }
    const d = json.data;
    return {
        status: d.status,
        reference: d.reference,
        amount: d.amount,
        currency: d.currency,
        customer: { email: d.customer?.email ?? '' },
        metadata: d.metadata ?? null,
        paidAt: d.paid_at ?? null,
        channel: d.channel ?? null,
    };
}

/**
 * Paystack signs webhook payloads with HMAC-SHA512 of the raw request body.
 * We must verify with the SAME body string the request arrived with — do not
 * re-serialize the JSON.
 */
export function verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null,
    secret: string
): boolean {
    if (!signatureHeader) return false;
    const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
    // Constant-time compare to thwart timing attacks.
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}
