import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const {
    verifyIdTokenMock,
    userFindOneMock,
    courseFindMock,
    courseCreateMock,
    enrollmentFindMock,
    dbConnectMock,
} = vi.hoisted(() => ({
    verifyIdTokenMock: vi.fn(),
    userFindOneMock: vi.fn(),
    courseFindMock: vi.fn().mockResolvedValue([]),
    courseCreateMock: vi.fn(),
    enrollmentFindMock: vi.fn().mockResolvedValue([]),
    dbConnectMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/firebase-admin', () => ({
    adminAuth: () => ({ verifyIdToken: verifyIdTokenMock }),
    adminStorage: () => ({}),
}));

vi.mock('@/lib/mongodb', () => ({ default: dbConnectMock }));

vi.mock('@/models/User', () => ({
    default: {
        findOne: (..._args: unknown[]) => ({ lean: () => userFindOneMock() }),
    },
}));

vi.mock('@/models/Course', () => ({
    default: {
        find: (query: unknown) => Promise.resolve(courseFindMock(query)),
        create: (...args: unknown[]) => courseCreateMock(...args),
    },
}));

vi.mock('@/models/Enrollment', () => ({
    default: {
        find: () => Promise.resolve(enrollmentFindMock()),
    },
}));

import { GET, POST } from './route';

function request(url: string, init: RequestInit = {}): NextRequest {
    const headers = new Headers(init.headers);
    const merged: RequestInit = { ...init, headers };
    return new NextRequest(url, merged as ConstructorParameters<typeof NextRequest>[1]);
}

function authedRequest(url: string, init: RequestInit = {}): NextRequest {
    const headers = new Headers(init.headers);
    headers.set('Authorization', 'Bearer t');
    return request(url, { ...init, headers });
}

function profile(uid: string, role: string) {
    return { uid, email: `${uid}@x.com`, displayName: uid, role };
}

beforeEach(() => {
    verifyIdTokenMock.mockReset();
    userFindOneMock.mockReset();
    courseFindMock.mockReset().mockResolvedValue([]);
    courseCreateMock.mockReset();
    enrollmentFindMock.mockReset().mockResolvedValue([]);
});

describe('GET /api/courses', () => {
    it('filters to status:published for unauthenticated callers', async () => {
        await GET(request('http://localhost/api/courses'));
        expect(courseFindMock).toHaveBeenCalledWith({ status: 'published' });
    });

    it('filters to status:published for student callers', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'stu' });
        userFindOneMock.mockResolvedValue(profile('stu', 'student'));
        await GET(authedRequest('http://localhost/api/courses'));
        expect(courseFindMock).toHaveBeenCalledWith({ status: 'published' });
    });

    it('returns all courses (incl. drafts) for an admin', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'a' });
        userFindOneMock.mockResolvedValue(profile('a', 'admin'));
        await GET(authedRequest('http://localhost/api/courses'));
        expect(courseFindMock).toHaveBeenCalledWith({});
    });

    it('returns all courses for an instructor', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'i' });
        userFindOneMock.mockResolvedValue(profile('i', 'instructor'));
        await GET(authedRequest('http://localhost/api/courses'));
        expect(courseFindMock).toHaveBeenCalledWith({});
    });
});

describe('POST /api/courses', () => {
    const validBody = {
        title: 'Test',
        category: 'Cert',
        instructor: { name: 'I', avatarUrl: 'https://x', verified: true },
        duration: 4,
        level: 'Beginner',
        price: 100,
        imageUrl: '/x.png',
        imageHint: 'h',
        description: 'd',
    };

    it('returns 401 when not authenticated', async () => {
        const res = await POST(
            request('http://localhost/api/courses', {
                method: 'POST',
                body: JSON.stringify(validBody),
            }),
            {}
        );
        expect(res.status).toBe(401);
    });

    it('forbids students from creating courses', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 's' });
        userFindOneMock.mockResolvedValue(profile('s', 'student'));
        const res = await POST(
            authedRequest('http://localhost/api/courses', {
                method: 'POST',
                body: JSON.stringify(validBody),
            }),
            {}
        );
        expect(res.status).toBe(403);
    });

    it('allows instructors to create draft courses (admin can publish)', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'i' });
        userFindOneMock.mockResolvedValue(profile('i', 'instructor'));
        courseCreateMock.mockResolvedValue({ _id: 'c1', ...validBody, status: 'draft' });

        const res = await POST(
            authedRequest('http://localhost/api/courses', {
                method: 'POST',
                body: JSON.stringify({ ...validBody, status: 'published' }),
            }),
            {}
        );
        expect(res.status).toBe(201);
        // Status forced back to draft for non-admins.
        expect(courseCreateMock).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'draft' })
        );
    });

    it('admin POST may keep status=published', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'a' });
        userFindOneMock.mockResolvedValue(profile('a', 'admin'));
        courseCreateMock.mockResolvedValue({ _id: 'c1' });

        await POST(
            authedRequest('http://localhost/api/courses', {
                method: 'POST',
                body: JSON.stringify({ ...validBody, status: 'published' }),
            }),
            {}
        );
        expect(courseCreateMock).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'published' })
        );
    });
});
