import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/auth-server';

/**
 * POST /api/users/password-changed — clears the forced-change flag once the
 * signed-in user has actually set their own password (see mustChangePassword
 * on the User model, set when a student's first payment activates their
 * account with a system-generated password).
 */
export const POST = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();
        await User.findOneAndUpdate({ uid: auth.uid }, { $set: { mustChangePassword: false } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('POST /api/users/password-changed failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
