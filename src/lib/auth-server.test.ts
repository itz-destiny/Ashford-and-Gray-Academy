import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { AuthContext, Role } from './auth-server';

// Hoisted mocks so they're set up before module imports.
const { verifyIdTokenMock, findOneMock, dbConnectMock } = vi.hoisted(() => ({
    verifyIdTokenMock: vi.fn(),
    findOneMock: vi.fn(),
    dbConnectMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./firebase-admin', () => ({
    adminAuth: () => ({ verifyIdToken: verifyIdTokenMock }),
    adminStorage: () => ({}),
}));

vi.mock('./mongodb', () => ({ default: dbConnectMock }));

vi.mock('@/models/User', () => ({
    default: {
        findOne: (...args: unknown[]) => ({
            lean: () => findOneMock(...args),
        }),
    },
}));

import { AuthError, authenticate, requireRole, withAuth } from './auth-server';

function makeRequest(headers: Record<string, string> = {}): NextRequest {
    return new NextRequest('http://localhost/api/test', { headers });
}

beforeEach(() => {
    verifyIdTokenMock.mockReset();
    findOneMock.mockReset();
    dbConnectMock.mockClear();
});

describe('AuthError', () => {
    it('carries status and message', () => {
        const err = new AuthError(403, 'nope');
        expect(err.status).toBe(403);
        expect(err.message).toBe('nope');
        expect(err.name).toBe('AuthError');
    });
});

describe('authenticate', () => {
    it('rejects requests without an Authorization header', async () => {
        await expect(authenticate(makeRequest())).rejects.toMatchObject({
            status: 401,
            message: /Missing Authorization/,
        });
    });

    it('rejects non-Bearer schemes', async () => {
        await expect(
            authenticate(makeRequest({ Authorization: 'Basic abc' }))
        ).rejects.toMatchObject({ status: 401, message: /Bearer/ });
    });

    it('rejects empty Bearer tokens', async () => {
        await expect(
            authenticate(makeRequest({ Authorization: 'Bearer ' }))
        ).rejects.toMatchObject({ status: 401, message: /Empty/ });
    });

    it('returns 401 when token verification fails', async () => {
        verifyIdTokenMock.mockRejectedValue(new Error('bad token'));
        await expect(
            authenticate(makeRequest({ Authorization: 'Bearer abc' }))
        ).rejects.toMatchObject({ status: 401, message: /Invalid or expired/ });
    });

    it('returns 403 when verified user has no Mongo profile', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'firebase-uid' });
        findOneMock.mockResolvedValue(null);
        await expect(
            authenticate(makeRequest({ Authorization: 'Bearer abc' }))
        ).rejects.toMatchObject({ status: 403, message: /profile not found/ });
    });

    it('returns the auth context for a valid token + profile', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'firebase-uid' });
        findOneMock.mockResolvedValue({
            uid: 'firebase-uid',
            email: 'x@example.com',
            displayName: 'Test',
            role: 'student',
        });

        const ctx = await authenticate(makeRequest({ Authorization: 'Bearer abc' }));
        expect(ctx).toEqual<AuthContext>({
            uid: 'firebase-uid',
            email: 'x@example.com',
            displayName: 'Test',
            role: 'student',
        });
        expect(dbConnectMock).toHaveBeenCalledOnce();
    });
});

describe('requireRole', () => {
    const base: AuthContext = {
        uid: 'u',
        email: 'x@y.com',
        displayName: 'X',
        role: 'student',
    };

    it('passes when the role is allowed', () => {
        expect(() => requireRole(base, ['student'] as Role[])).not.toThrow();
    });

    it('throws 403 when the role is not in the allowlist', () => {
        expect(() => requireRole(base, ['admin'] as Role[])).toThrowError(AuthError);
        try {
            requireRole(base, ['admin'] as Role[]);
        } catch (err) {
            expect((err as AuthError).status).toBe(403);
        }
    });
});

describe('withAuth', () => {
    it('responds with 401 JSON when authentication fails', async () => {
        const handler = vi.fn();
        const wrapped = withAuth(async (_req, _ctx) => handler());
        const res = await wrapped(makeRequest(), {});
        expect(res.status).toBe(401);
        expect(handler).not.toHaveBeenCalled();
        const body = await res.json();
        expect(body.error).toMatch(/Missing Authorization/);
    });

    it('invokes the wrapped handler with the auth context on success', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'u1' });
        findOneMock.mockResolvedValue({
            uid: 'u1',
            email: 'a@b.com',
            displayName: 'A',
            role: 'instructor',
        });
        const handler = vi.fn(async (_req: NextRequest, ctx: { auth: AuthContext }) => {
            return Response.json({ ok: true, role: ctx.auth.role });
        });
        const wrapped = withAuth<{ params?: unknown }>(handler);
        const res = await wrapped(makeRequest({ Authorization: 'Bearer t' }), { params: {} });
        expect(res.status).toBe(200);
        expect(handler).toHaveBeenCalledOnce();
        const body = await res.json();
        expect(body).toEqual({ ok: true, role: 'instructor' });
    });

    it('returns 500 when the handler throws an unexpected error', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'u1' });
        findOneMock.mockResolvedValue({
            uid: 'u1',
            email: 'a@b.com',
            displayName: 'A',
            role: 'student',
        });
        const wrapped = withAuth(async () => {
            throw new Error('boom');
        });
        const res = await wrapped(makeRequest({ Authorization: 'Bearer t' }), {});
        expect(res.status).toBe(500);
    });
});
