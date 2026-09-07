import jwt from 'jsonwebtoken';

// Generates the JWT the Meeting SDK's client.join() call needs to authorize
// an embedded join — role 1 (host) requires pairing this with a ZAK token,
// role 0 (participant) needs nothing else. Per Zoom's Meeting SDK auth spec,
// `exp`/`tokenExp` must be at least 1800s after `iat`.
//
// A Meeting SDK app can only join meetings hosted within the same Zoom
// account that created it, so the caller must pass the SDK Client ID/Secret
// belonging to whichever account actually hosts this specific meeting (see
// ZoomHostAccount.sdkClientId/sdkClientSecret in zoom-hosts.ts) — never a
// single global pair.
export function generateZoomSdkSignature(
    meetingNumber: string,
    role: 0 | 1,
    credentials: { sdkClientId?: string; sdkClientSecret?: string }
): string {
    const sdkKey = credentials.sdkClientId;
    const sdkSecret = credentials.sdkClientSecret;
    if (!sdkKey || !sdkSecret) {
        throw new Error('No Meeting SDK app is configured for the Zoom account this class was scheduled under.');
    }

    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    return jwt.sign(
        { sdkKey, mn: meetingNumber, role, iat, exp, tokenExp: exp },
        sdkSecret,
        { algorithm: 'HS256' }
    );
}
