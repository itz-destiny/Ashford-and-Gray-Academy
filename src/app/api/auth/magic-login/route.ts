import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

const schema = z.object({ token: z.string().min(10) });

/**
 * POST /api/auth/magic-login — public. Exchanges a welcome-email link token
 * for a fresh Firebase custom token, so a new user can sign in by clicking a
 * link instead of typing an email + temporary password. Only valid while the
 * account still has mustChangePassword set — see src/lib/magic-login.ts.
 */
export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    try {
        await limiter.check(null, 20, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    try {
        await dbConnect();
        const user = await User.findOne({ magicLoginToken: parsed.data.token })
            .select('uid mustChangePassword')
            .lean<{ uid: string; mustChangePassword?: boolean } | null>();

        if (!user || !user.mustChangePassword) {
            return NextResponse.json(
                { error: 'This link has expired or already been used. Please sign in with your email and password instead.' },
                { status: 400 }
            );
        }

        const customToken = await adminAuth().createCustomToken(user.uid);
        return NextResponse.json({ success: true, customToken });
    } catch (err: any) {
        console.error('auth/magic-login route error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
