import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from './rate-limit';

beforeEach(() => {
    // Ensure the in-memory backend is selected by clearing any Upstash config.
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe('rateLimit (in-memory fallback)', () => {
    it('allows up to the limit, then rejects', async () => {
        const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
        const token = 'ip-1';
        await limiter.check(null, 3, token);
        await limiter.check(null, 3, token);
        await limiter.check(null, 3, token);
        await expect(limiter.check(null, 3, token)).rejects.toThrow(/Rate limit/);
    });

    it('separates buckets per token', async () => {
        const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
        await limiter.check(null, 1, 'a');
        // 'b' has its own bucket so should still succeed.
        await expect(limiter.check(null, 1, 'b')).resolves.toBeUndefined();
    });

    it('refills after the interval elapses', async () => {
        const limiter = rateLimit({ interval: 1, uniqueTokenPerInterval: 100 });
        await limiter.check(null, 1, 'c');
        await new Promise(r => setTimeout(r, 5));
        await expect(limiter.check(null, 1, 'c')).resolves.toBeUndefined();
    });
});
