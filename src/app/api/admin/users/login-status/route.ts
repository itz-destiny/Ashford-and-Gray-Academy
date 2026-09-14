import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { adminAuth } from '@/lib/firebase-admin';
import { ROLE_TITLES } from '../route';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admin/users/login-status route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// Bulk, paginated — far cheaper than one getUser() call per account when
// checking hundreds of accounts at once.
async function getSignInMap(): Promise<Map<string, string | null>> {
    const map = new Map<string, string | null>();
    let pageToken: string | undefined;
    do {
        const result = await adminAuth().listUsers(1000, pageToken);
        for (const u of result.users) {
            map.set(u.uid, u.metadata.lastSignInTime || null);
        }
        pageToken = result.pageToken;
    } while (pageToken);
    return map;
}

// =============================================================================
// GET /api/admin/users/login-status?role=student|instructor|all — every
// account's real login status (Firebase lastSignInTime), for the admin
// dashboard's login-tracking view. Admin only.
// =============================================================================
export const GET = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin']);
        await dbConnect();

        const role = req.nextUrl.searchParams.get('role') || 'all';
        const query: Record<string, unknown> = {};
        if (role !== 'all') query.role = role;

        const [users, signInMap] = await Promise.all([
            User.find(query).select('uid displayName email role createdAt photoURL school monitorSlotIndex').sort({ displayName: 1 }).lean(),
            getSignInMap(),
        ]);

        const rows = users.map((u: any) => {
            const lastSignInTime = signInMap.get(u.uid) ?? null;
            return {
                uid: u.uid,
                displayName: u.displayName,
                email: u.email,
                role: u.role,
                roleTitle: ROLE_TITLES[u.role] || u.role,
                createdAt: u.createdAt,
                photoURL: u.photoURL,
                school: u.school,
                monitorSlotIndex: u.monitorSlotIndex,
                lastSignInTime,
                hasLoggedIn: !!lastSignInTime,
            };
        });

        const loggedInCount = rows.filter((r) => r.hasLoggedIn).length;

        return NextResponse.json({ success: true, total: rows.length, loggedInCount, users: rows });
    } catch (err) {
        return handleError(err);
    }
});
