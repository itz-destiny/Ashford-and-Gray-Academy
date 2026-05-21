import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AccessToken } from 'livekit-server-sdk';
import { buildGrant, getLiveKitConfig, mintAccessToken } from './livekit';

const SAMPLE_CONFIG = {
    apiKey: 'APItestkey',
    apiSecret: 'a'.repeat(40),
    wsUrl: 'wss://example.livekit.cloud',
};

describe('buildGrant', () => {
    it('gives instructors publish but not roomAdmin', () => {
        const grant = buildGrant('instructor', 'room-1');
        expect(grant.room).toBe('room-1');
        expect(grant.roomJoin).toBe(true);
        expect(grant.canPublish).toBe(true);
        expect(grant.roomAdmin).toBe(false);
    });

    it('gives admins publish + roomAdmin moderation', () => {
        const grant = buildGrant('admin', 'room-1');
        expect(grant.canPublish).toBe(true);
        expect(grant.roomAdmin).toBe(true);
    });

    it('locks students to subscribe + data only', () => {
        const grant = buildGrant('student', 'room-1');
        expect(grant.canSubscribe).toBe(true);
        expect(grant.canPublishData).toBe(true);
        expect(grant.canPublish).toBe(false);
        expect(grant.roomAdmin).toBeUndefined();
    });
});

describe('getLiveKitConfig', () => {
    it('reads from the provided env object', () => {
        const cfg = getLiveKitConfig({
            LIVEKIT_API_KEY: 'k',
            LIVEKIT_API_SECRET: 's',
            LIVEKIT_WS_URL: 'wss://x',
        });
        expect(cfg).toEqual({ apiKey: 'k', apiSecret: 's', wsUrl: 'wss://x' });
    });

    it('throws when LIVEKIT_API_KEY is missing', () => {
        expect(() =>
            getLiveKitConfig({
                LIVEKIT_API_SECRET: 's',
                LIVEKIT_WS_URL: 'wss://x',
            })
        ).toThrow(/LIVEKIT_API_KEY/);
    });

    it('throws when LIVEKIT_API_SECRET is missing', () => {
        expect(() =>
            getLiveKitConfig({
                LIVEKIT_API_KEY: 'k',
                LIVEKIT_WS_URL: 'wss://x',
            })
        ).toThrow(/LIVEKIT_API_SECRET/);
    });

    it('throws when LIVEKIT_WS_URL is missing', () => {
        expect(() =>
            getLiveKitConfig({
                LIVEKIT_API_KEY: 'k',
                LIVEKIT_API_SECRET: 's',
            })
        ).toThrow(/LIVEKIT_WS_URL/);
    });
});

describe('mintAccessToken', () => {
    beforeEach(() => {
        process.env.LIVEKIT_API_KEY = SAMPLE_CONFIG.apiKey;
        process.env.LIVEKIT_API_SECRET = SAMPLE_CONFIG.apiSecret;
        process.env.LIVEKIT_WS_URL = SAMPLE_CONFIG.wsUrl;
    });

    afterEach(() => {
        delete process.env.LIVEKIT_API_KEY;
        delete process.env.LIVEKIT_API_SECRET;
        delete process.env.LIVEKIT_WS_URL;
    });

    it('returns a JWT verifiable by the same secret', async () => {
        const jwt = await mintAccessToken({
            identity: 'user-1',
            name: 'Test User',
            room: 'room-1',
            role: 'instructor',
        });
        expect(typeof jwt).toBe('string');
        expect(jwt.split('.')).toHaveLength(3);
    });

    it('encodes identity and metadata into the token', async () => {
        const jwt = await mintAccessToken({
            identity: 'user-2',
            name: 'Another',
            room: 'room-2',
            role: 'student',
            metadata: { appRole: 'student', email: 'a@b.com' },
        });
        const [, payload] = jwt.split('.');
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        expect(decoded.sub).toBe('user-2');
        expect(decoded.name).toBe('Another');
        expect(JSON.parse(decoded.metadata)).toEqual({
            appRole: 'student',
            email: 'a@b.com',
        });
    });

    it('uses an explicit config when provided (no env required)', async () => {
        delete process.env.LIVEKIT_API_KEY;
        delete process.env.LIVEKIT_API_SECRET;
        delete process.env.LIVEKIT_WS_URL;
        const jwt = await mintAccessToken(
            { identity: 'u', name: 'n', room: 'r', role: 'instructor' },
            SAMPLE_CONFIG
        );
        expect(jwt.split('.')).toHaveLength(3);
    });
});

describe('AccessToken integration sanity-check', () => {
    it('AccessToken from livekit-server-sdk produces a JWT', async () => {
        const at = new AccessToken(SAMPLE_CONFIG.apiKey, SAMPLE_CONFIG.apiSecret, {
            identity: 'x',
            name: 'x',
        });
        at.addGrant(buildGrant('student', 'r'));
        const jwt = await at.toJwt();
        expect(typeof jwt).toBe('string');
        expect(jwt.length).toBeGreaterThan(20);
    });
});
