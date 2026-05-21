import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Hoisted shared mocks.
const { verifyIdTokenMock, userFindOneMock, enrollmentFindMock, enrollmentFindOneMock, enrollmentCreateMock, dbConnectMock } =
    vi.hoisted(() => ({
        verifyIdTokenMock: vi.fn(),
        userFindOneMock: vi.fn(),
        enrollmentFindMock: vi.fn(),
        enrollmentFindOneMock: vi.fn(),
        enrollmentCreateMock: vi.fn(),
        dbConnectMock: vi.fn().mockResolvedValue(undefined),
    }));

vi.mock('@/lib/firebase-admin', () => ({
    adminAuth: () => ({ verifyIdToken: verifyIdTokenMock }),
    adminStorage: () => ({}),
}));

vi.mock('@/lib/mongodb', () => ({ default: dbConnectMock }));

vi.mock('@/models/User', () => ({
    default: {
        findOne: (..._args: unknown[]) => ({
            lean: () => userFindOneMock(),
        }),
    },
}));

vi.mock('@/models/Enrollment', () => ({
    default: {
        find: (..._args: unknown[]) => ({
            populate: () => ({
                exec: () => enrollmentFindMock(),
            }),
        }),
        findOne: (..._args: unknown[]) => enrollmentFindOneMock(),
        create: (...args: unknown[]) => enrollmentCreateMock(...args),
    },
}));

import { GET, POST } from './route';

function request(url: string, init: RequestInit = {}): NextRequest {
    const headers = new Headers(init.headers);
    if (!headers.has('Authorization')) headers.set('Authorization', 'Bearer token');
    const merged: RequestInit = { ...init, headers };
    return new NextRequest(url, merged as ConstructorParameters<typeof NextRequest>[1]);
}

function userProfile(uid: string, role: string) {
    return { uid, email: `${uid}@example.com`, displayName: uid, role };
}

beforeEach(() => {
    verifyIdTokenMock.mockReset();
    userFindOneMock.mockReset();
    enrollmentFindMock.mockReset();
    enrollmentFindOneMock.mockReset();
    enrollmentCreateMock.mockReset();
    dbConnectMock.mockClear();
});

describe('GET /api/enrollments', () => {
    it('returns the caller\'s own enrollments when no ?userId is given', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'student-1' });
        userFindOneMock.mockResolvedValue(userProfile('student-1', 'student'));
        enrollmentFindMock.mockResolvedValue([]);

        const res = await GET(request('http://localhost/api/enrollments'), {});
        expect(res.status).toBe(200);
    });

    it('blocks a student from reading another user\'s enrollments', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'student-1' });
        userFindOneMock.mockResolvedValue(userProfile('student-1', 'student'));

        const res = await GET(
            request('http://localhost/api/enrollments?userId=student-2'),
            {}
        );
        expect(res.status).toBe(403);
        expect(enrollmentFindMock).not.toHaveBeenCalled();
    });

    it('allows an instructor to read another user\'s enrollments', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'instructor-1' });
        userFindOneMock.mockResolvedValue(userProfile('instructor-1', 'instructor'));
        enrollmentFindMock.mockResolvedValue([]);

        const res = await GET(
            request('http://localhost/api/enrollments?userId=student-2'),
            {}
        );
        expect(res.status).toBe(200);
        expect(enrollmentFindMock).toHaveBeenCalled();
    });

    it('allows admin and registrar roles to query others', async () => {
        for (const role of ['admin', 'registrar', 'course_registrar'] as const) {
            verifyIdTokenMock.mockResolvedValue({ uid: 'staff' });
            userFindOneMock.mockResolvedValue(userProfile('staff', role));
            enrollmentFindMock.mockResolvedValue([]);

            const res = await GET(
                request('http://localhost/api/enrollments?userId=somebody-else'),
                {}
            );
            expect(res.status, `role=${role}`).toBe(200);
        }
    });

    it('returns 401 when no Authorization header is present', async () => {
        const req = new NextRequest('http://localhost/api/enrollments');
        const res = await GET(req, {});
        expect(res.status).toBe(401);
    });
});

describe('POST /api/enrollments', () => {
    it('uses the authenticated uid, never trusting client-supplied userId', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'student-1' });
        userFindOneMock.mockResolvedValue(userProfile('student-1', 'student'));
        enrollmentFindOneMock.mockResolvedValue(null);
        enrollmentCreateMock.mockResolvedValue({ _id: 'enrol-1' });

        const req = request('http://localhost/api/enrollments', {
            method: 'POST',
            body: JSON.stringify({ userId: 'IMPERSONATED', courseId: 'course-9' }),
        });
        const res = await POST(req, {});
        expect(res.status).toBe(201);
        expect(enrollmentCreateMock).toHaveBeenCalledWith({
            userId: 'student-1',
            courseId: 'course-9',
        });
    });

    it('returns 400 on invalid body', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'student-1' });
        userFindOneMock.mockResolvedValue(userProfile('student-1', 'student'));

        const req = request('http://localhost/api/enrollments', {
            method: 'POST',
            body: JSON.stringify({ courseId: '' }),
        });
        const res = await POST(req, {});
        expect(res.status).toBe(400);
    });

    it('is idempotent when an enrollment already exists', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'student-1' });
        userFindOneMock.mockResolvedValue(userProfile('student-1', 'student'));
        enrollmentFindOneMock.mockResolvedValue({ _id: 'existing' });

        const req = request('http://localhost/api/enrollments', {
            method: 'POST',
            body: JSON.stringify({ courseId: 'course-9' }),
        });
        const res = await POST(req, {});
        expect(res.status).toBe(200);
        expect(enrollmentCreateMock).not.toHaveBeenCalled();
    });
});
