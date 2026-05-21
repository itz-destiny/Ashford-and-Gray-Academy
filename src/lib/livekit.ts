import { AccessToken, type VideoGrant } from 'livekit-server-sdk';

export type LiveKitRole = 'instructor' | 'student' | 'admin';

export type LiveKitConfig = {
    apiKey: string;
    apiSecret: string;
    wsUrl: string;
};

export type TokenInput = {
    identity: string;
    name: string;
    room: string;
    role: LiveKitRole;
    metadata?: Record<string, unknown>;
    ttl?: string;
};

const DEFAULT_TTL = '4h';

export type EnvLike = Record<string, string | undefined>;

export function getLiveKitConfig(env: EnvLike = process.env): LiveKitConfig {
    const apiKey = env.LIVEKIT_API_KEY;
    const apiSecret = env.LIVEKIT_API_SECRET;
    const wsUrl = env.LIVEKIT_WS_URL;
    if (!apiKey || !apiSecret || !wsUrl) {
        throw new Error(
            'LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET and LIVEKIT_WS_URL.'
        );
    }
    return { apiKey, apiSecret, wsUrl };
}

/**
 * Maps an application role to LiveKit room grants.
 *
 * Why: students subscribe-only by default keeps a classroom orderly; the
 * instructor (or admin) can elevate a student to publisher at runtime via the
 * LiveKit server API when needed (e.g. Q&A "raise hand").
 */
export function buildGrant(role: LiveKitRole, room: string): VideoGrant {
    const base: VideoGrant = {
        room,
        roomJoin: true,
        canSubscribe: true,
        canPublishData: true,
    };

    if (role === 'instructor' || role === 'admin') {
        return {
            ...base,
            canPublish: true,
            roomAdmin: role === 'admin',
        };
    }

    return { ...base, canPublish: false };
}

export async function mintAccessToken(
    input: TokenInput,
    config: LiveKitConfig = getLiveKitConfig()
): Promise<string> {
    const at = new AccessToken(config.apiKey, config.apiSecret, {
        identity: input.identity,
        name: input.name,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
        ttl: input.ttl ?? DEFAULT_TTL,
    });
    at.addGrant(buildGrant(input.role, input.room));
    return await at.toJwt();
}
