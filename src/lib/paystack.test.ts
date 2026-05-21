import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { getPaystackConfig, verifyWebhookSignature } from './paystack';

const SECRET = 'sk_test_abc123';

function sign(body: string, secret = SECRET): string {
    return createHmac('sha512', secret).update(body).digest('hex');
}

describe('getPaystackConfig', () => {
    it('reads secret, public key, and builds callback URL from env', () => {
        const cfg = getPaystackConfig({
            PAYSTACK_SECRET_KEY: 'sk',
            NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: 'pk',
            NEXT_PUBLIC_APP_URL: 'https://academy.example.com/',
        });
        expect(cfg.secretKey).toBe('sk');
        expect(cfg.publicKey).toBe('pk');
        // Trailing slash is normalized.
        expect(cfg.callbackUrl).toBe('https://academy.example.com/payments/callback');
    });

    it('defaults callbackUrl to localhost when NEXT_PUBLIC_APP_URL is missing', () => {
        const cfg = getPaystackConfig({ PAYSTACK_SECRET_KEY: 'sk' });
        expect(cfg.callbackUrl).toBe('http://localhost:9002/payments/callback');
    });

    it('throws when PAYSTACK_SECRET_KEY is missing', () => {
        expect(() => getPaystackConfig({})).toThrow(/PAYSTACK_SECRET_KEY/);
    });
});

describe('verifyWebhookSignature', () => {
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'r' } });

    it('accepts a correctly signed body', () => {
        const sig = sign(body);
        expect(verifyWebhookSignature(body, sig, SECRET)).toBe(true);
    });

    it('rejects when signature is missing', () => {
        expect(verifyWebhookSignature(body, null, SECRET)).toBe(false);
        expect(verifyWebhookSignature(body, '', SECRET)).toBe(false);
    });

    it('rejects when the body is tampered with', () => {
        const sig = sign(body);
        const tampered = body.replace('charge.success', 'charge.failed');
        expect(verifyWebhookSignature(tampered, sig, SECRET)).toBe(false);
    });

    it('rejects when signed with a different secret', () => {
        const sig = sign(body, 'wrong-secret');
        expect(verifyWebhookSignature(body, sig, SECRET)).toBe(false);
    });

    it('rejects truncated signatures (length mismatch)', () => {
        const sig = sign(body).slice(0, 32);
        expect(verifyWebhookSignature(body, sig, SECRET)).toBe(false);
    });
});
