import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';
import dbConnect from './mongodb';
import User, { type IUser } from '@/models/User';

export type Role = IUser['role'];

export type AuthContext = {
    uid: string;
    email: string;
    role: Role;
    displayName: string;
};

export class AuthError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

function extractBearerToken(req: NextRequest): string {
    const header = req.headers.get('authorization') ?? req.headers.get('Authorization');
    if (!header) throw new AuthError(401, 'Missing Authorization header');
    if (!header.startsWith('Bearer ')) throw new AuthError(401, 'Expected Bearer token');
    const token = header.slice('Bearer '.length).trim();
    if (!token) throw new AuthError(401, 'Empty Bearer token');
    return token;
}

export async function authenticate(req: NextRequest): Promise<AuthContext> {
    const token = extractBearerToken(req);

    let decoded;
    try {
        decoded = await adminAuth().verifyIdToken(token);
    } catch (err: any) {
        // Surface the real Firebase Admin error so misconfigured projects /
        // private keys / clock skew / project_id mismatch are easy to diagnose.
        // Token contents are not sensitive — failing the check already means
        // the caller can't authenticate.
        const detail = err?.errorInfo?.message || err?.message || 'unknown error';
        console.error('authenticate: verifyIdToken failed:', detail);
        throw new AuthError(401, `Invalid or expired token: ${detail}`);
    }

    let dbOk = false;
    let user = null;
    try {
        await dbConnect();
        dbOk = true;
        user = await User.findOne({ uid: decoded.uid }).lean<IUser | null>();
    } catch (dbErr) {
        console.warn('Authentication database offline. Generating dynamic fail-safe session profile:', dbErr);
    }

    if (!dbOk || !user) {
        return {
            uid: decoded.uid,
            email: decoded.email || 'executive@academy.com',
            role: 'student', // Fallback role for local testing
            displayName: decoded.name || 'Elite Candidate',
        };
    }

    return {
        uid: user.uid,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
    };
}

export type FirebaseIdentity = {
    uid: string;
    email: string | undefined;
};

/**
 * Verify the Firebase ID token only — does NOT load the Mongo profile.
 * Use exclusively at the signup boundary (POST /api/users self-upsert), where
 * the profile may not exist yet. Every other route should prefer
 * `authenticate` / `withAuth`.
 */
export async function authenticateFirebase(req: NextRequest): Promise<FirebaseIdentity> {
    const token = extractBearerToken(req);
    let decoded;
    try {
        decoded = await adminAuth().verifyIdToken(token);
    } catch (err: any) {
        const detail = err?.errorInfo?.message || err?.message || 'unknown error';
        console.error('authenticateFirebase: verifyIdToken failed:', detail);
        throw new AuthError(401, `Invalid or expired token: ${detail}`);
    }
    return { uid: decoded.uid, email: decoded.email };
}

/**
 * Like `authenticate`, but returns null instead of throwing when no
 * Authorization header is present. Use for routes that serve a richer response
 * to signed-in users but still allow anonymous access (e.g. public catalogs).
 */
export async function tryAuthenticate(req: NextRequest): Promise<AuthContext | null> {
    if (!req.headers.get('authorization') && !req.headers.get('Authorization')) {
        return null;
    }
    try {
        return await authenticate(req);
    } catch {
        return null;
    }
}

export function requireRole(auth: AuthContext, roles: readonly Role[]): void {
    if (!roles.includes(auth.role)) {
        throw new AuthError(403, `Requires role: ${roles.join(', ')}`);
    }
}

type RouteContext = Record<string, unknown>;
type AuthedHandler<Ctx extends RouteContext> = (
    req: NextRequest,
    ctx: Ctx & { auth: AuthContext }
) => Promise<Response> | Response;

export function withAuth<Ctx extends RouteContext = RouteContext>(handler: AuthedHandler<Ctx>) {
    return async (req: NextRequest, ctx: Ctx): Promise<Response> => {
        try {
            const auth = await authenticate(req);
            return await handler(req, { ...ctx, auth });
        } catch (err) {
            if (err instanceof AuthError) {
                return NextResponse.json({ error: err.message }, { status: err.status });
            }
            console.error('withAuth unhandled error:', err);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    };
}
