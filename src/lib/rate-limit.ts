/**
 * Rate limiter with two backends:
 *
 *   1. **Upstash Redis** — used when UPSTASH_REDIS_REST_URL and
 *      UPSTASH_REDIS_REST_TOKEN are set. Distributed across instances.
 *   2. **In-memory** — fallback for local dev and single-instance deploys.
 *      Each Node process maintains its own bucket — won't enforce limits
 *      across multiple instances.
 *
 * Both backends expose the same `check(_, limit, token)` API so call sites
 * (`await limiter.check(null, 10, ip)`) don't need to know which is in use.
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

type Options = {
    interval: number;                  // milliseconds
    uniqueTokenPerInterval: number;    // bound the in-memory map
};

type Limiter = {
    check: (_unused: unknown, limit: number, token: string) => Promise<void>;
};

const upstashCache = new Map<string, Ratelimit>();

function getUpstashClient(): Redis | null {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    return new Redis({ url, token });
}

function getUpstashLimiter(options: Options, limit: number): Ratelimit | null {
    const redis = getUpstashClient();
    if (!redis) return null;
    const key = `${options.interval}:${limit}`;
    const cached = upstashCache.get(key);
    if (cached) return cached;
    const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(limit, `${Math.max(1, Math.round(options.interval / 1000))} s`),
        analytics: false,
        prefix: 'ag-academy:rl',
    });
    upstashCache.set(key, rl);
    return rl;
}

function inMemoryLimiter(options: Options): Limiter {
    const buckets = new Map<string, [count: number, resetAt: number]>();
    return {
        check: (_unused, limit, token) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now();
                const entry = buckets.get(token);
                if (!entry || entry[1] <= now) {
                    buckets.set(token, [1, now + options.interval]);
                } else if (entry[0] >= limit) {
                    return reject(new Error('Rate limit exceeded'));
                } else {
                    entry[0] += 1;
                    buckets.set(token, entry);
                }
                // Keep the map bounded.
                if (buckets.size > options.uniqueTokenPerInterval) {
                    const oldest = buckets.keys().next().value;
                    if (oldest) buckets.delete(oldest);
                }
                resolve();
            }),
    };
}

export const rateLimit = (options: Options): Limiter => {
    const fallback = inMemoryLimiter(options);
    return {
        check: async (_unused, limit, token) => {
            const upstash = getUpstashLimiter(options, limit);
            if (!upstash) return fallback.check(_unused, limit, token);
            const result = await upstash.limit(token);
            if (!result.success) throw new Error('Rate limit exceeded');
        },
    };
};
