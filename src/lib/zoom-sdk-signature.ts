import jwt from 'jsonwebtoken';

// Generates the JWT the Meeting SDK's client.join() call needs to authorize
// an embedded join — role 1 (host) requires pairing this with a ZAK token,
// role 0 (participant) needs nothing else. Per Zoom's Meeting SDK auth spec,
// `exp`/`tokenExp` must be at least 1800s after `iat`.
export function generateZoomSdkSignature(meetingNumber: string, role: 0 | 1): string {
    const sdkKey = process.env.ZOOM_SDK_KEY;
    const sdkSecret = process.env.ZOOM_SDK_SECRET;
    if (!sdkKey || !sdkSecret) {
        throw new Error('Zoom Meeting SDK credentials are not configured.');
    }

    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    return jwt.sign(
        { appKey: sdkKey, mn: meetingNumber, role, iat, exp, tokenExp: exp },
        sdkSecret,
        { algorithm: 'HS256' }
    );
}
