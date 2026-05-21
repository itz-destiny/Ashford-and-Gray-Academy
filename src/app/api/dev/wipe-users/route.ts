import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';
import { assertDevEndpointAllowed } from '@/lib/dev-only';
import { AuthError } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 100 });

/**
 * Dev-only endpoint that wipes every user from both Firebase Auth and the
 * Mongo `users` collection. Pass `preserveUids` to keep specific accounts.
 *
 * Confirmation guard: requires `{ confirm: "WIPE_ALL_USERS" }` in the body
 * so it can't be triggered by an accidental GET or empty POST.
 */
const requestSchema = z.object({
    confirm: z.literal('WIPE_ALL_USERS'),
    preserveUids: z.array(z.string()).optional(),
});

async function deleteAllFirebaseUsers(preserve: Set<string>): Promise<{ deleted: number; failures: number }> {
    const auth = adminAuth();
    let pageToken: string | undefined;
    let deleted = 0;
    let failures = 0;

    do {
        const page = await auth.listUsers(1000, pageToken);
        pageToken = page.pageToken;
        const uidsToDelete = page.users
            .map(u => u.uid)
            .filter(uid => !preserve.has(uid));
        if (uidsToDelete.length === 0) continue;

        // Firebase deleteUsers caps at 1000 per call — listUsers already pages
        // at 1000 so a single call per page is fine.
        const result = await auth.deleteUsers(uidsToDelete);
        deleted += result.successCount;
        failures += result.failureCount;
    } while (pageToken);

    return { deleted, failures };
}

export async function POST(req: NextRequest): Promise<Response> {
    try {
        assertDevEndpointAllowed();
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    try {
        await limiter.check(null, 2, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            {
                error:
                    'Missing confirmation. POST with body {"confirm": "WIPE_ALL_USERS"}.',
                details: parsed.error.flatten(),
            },
            { status: 400 }
        );
    }

    const preserve = new Set(parsed.data.preserveUids ?? []);

    try {
        const firebase = await deleteAllFirebaseUsers(preserve);
        await dbConnect();
        const mongoQuery = preserve.size > 0 ? { uid: { $nin: Array.from(preserve) } } : {};
        const mongo = await User.deleteMany(mongoQuery);
        return NextResponse.json({
            message: 'User wipe complete.',
            firebase,
            mongoDeleted: mongo.deletedCount ?? 0,
            preservedUids: Array.from(preserve),
        });
    } catch (err: any) {
        console.error('wipe-users failed:', err);
        return NextResponse.json(
            { error: err?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
