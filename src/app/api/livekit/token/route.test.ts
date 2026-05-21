import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { verifyIdTokenMock, userFindOneMock, courseFindByIdMock, enrollmentFindOneMock, dbConnectMock } =
    vi.hoisted(() => ({
        verifyIdTokenMock: vi.fn(),
        userFindOneMock: vi.fn(),
        courseFindByIdMock: vi.fn(),
        enrollmentFindOneMock: vi.fn(),
        dbConnectMock: vi.fn().mockResolvedValue(undefined),
    }));

vi.mock('@/lib/firebase-admin', () => ({
    adminAuth: () => ({ verifyIdToken: verifyIdTokenMock }),
    adminStorage: () => ({}),
}));

vi.mock('@/lib/mongodb', () => ({ default: dbConnectMock }));

vi.mock('@/models/User', () => ({
    default: {
        findOne: () => ({ lean: () => userFindOneMock() }),
    },
}));

vi.mock('@/models/Course', () => ({
    default: {
        findById: () => ({ select: () => courseFindByIdMock() }),
    },
}));

vi.mock('@/models/Enrollment', () => ({
    default: {
        findOne: () => ({ select: () => enrollmentFindOneMock() }),
    },
}));

vi.mock('@/lib/livekit', async () => ({
    getLiveKitConfig: () => ({
        apiKey: 'k',
        apiSecret: 's',
        wsUrl: 'wss://x',
    }),
    mintAccessToken: vi.fn().mockResolvedValue('jwt-token'),
}));

import { POST } from './route';

function request(body: object, headers: Record<string, string> = {}): NextRequest {
    const h = new Headers({ Authorization: 'Bearer t', 'Content-Type': 'application/json', ...headers });
    return new NextRequest('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: h,
    } as ConstructorParameters<typeof NextRequest>[1]);
}

function profile(uid: string, role: string, displayName = uid) {
    return { uid, email: `${uid}@x.com`, displayName, role };
}

beforeEach(() => {
    verifyIdTokenMock.mockReset();
    userFindOneMock.mockReset();
    courseFindByIdMock.mockReset();
    enrollmentFindOneMock.mockReset();
});

describe('POST /api/livekit/token — course rooms', () => {
    it('blocks a student who is not enrolled', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'stu' });
        userFindOneMock.mockResolvedValue(profile('stu', 'student'));
        courseFindByIdMock.mockResolvedValue({
            _id: 'c1',
            instructorUid: 'instr1',
            instructor: { name: 'Instr' },
        });
        enrollmentFindOneMock.mockResolvedValue(null);

        const res = await POST(request({ room: 'course-c1' }), {});
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toMatch(/enrolled/);
    });

    it('allows an enrolled student', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'stu' });
        userFindOneMock.mockResolvedValue(profile('stu', 'student'));
        courseFindByIdMock.mockResolvedValue({
            _id: 'c1',
            instructorUid: 'instr1',
            instructor: { name: 'Instr' },
        });
        enrollmentFindOneMock.mockResolvedValue({ _id: 'e1' });

        const res = await POST(request({ room: 'course-c1' }), {});
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.token).toBe('jwt-token');
    });

    it('allows the course owner by UID', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'instr1' });
        userFindOneMock.mockResolvedValue(profile('instr1', 'instructor'));
        courseFindByIdMock.mockResolvedValue({
            _id: 'c1',
            instructorUid: 'instr1',
            instructor: { name: 'Someone Else' },
        });

        const res = await POST(request({ room: 'course-c1' }), {});
        expect(res.status).toBe(200);
        expect(enrollmentFindOneMock).not.toHaveBeenCalled();
    });

    it('falls back to display-name ownership for legacy courses without instructorUid', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'instr2' });
        userFindOneMock.mockResolvedValue(profile('instr2', 'instructor', 'Jane Doe'));
        courseFindByIdMock.mockResolvedValue({
            _id: 'c1',
            instructorUid: null,
            instructor: { name: 'Jane Doe' },
        });

        const res = await POST(request({ room: 'course-c1' }), {});
        expect(res.status).toBe(200);
    });

    it('always lets an admin join', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'admin1' });
        userFindOneMock.mockResolvedValue(profile('admin1', 'admin'));
        // No course lookup needed; admins bypass.
        const res = await POST(request({ room: 'course-anything' }), {});
        expect(res.status).toBe(200);
        expect(courseFindByIdMock).not.toHaveBeenCalled();
    });
});

describe('POST /api/livekit/token — ad-hoc meet- rooms', () => {
    it('lets any authenticated user join', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'stu' });
        userFindOneMock.mockResolvedValue(profile('stu', 'student'));
        const res = await POST(request({ room: 'meet-abc-12345' }), {});
        expect(res.status).toBe(200);
    });
});

describe('POST /api/livekit/token — unknown rooms', () => {
    it('rejects rooms that match no convention', async () => {
        verifyIdTokenMock.mockResolvedValue({ uid: 'stu' });
        userFindOneMock.mockResolvedValue(profile('stu', 'student'));
        const res = await POST(request({ room: 'foobar' }), {});
        expect(res.status).toBe(403);
    });
});
