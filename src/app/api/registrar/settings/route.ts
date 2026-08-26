import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import PlatformSettings from '@/models/PlatformSettings';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

const REGISTRAR_ROLES = ['admin', 'registrar'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('registrar/settings route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/registrar/settings — the single shared institution settings doc.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, REGISTRAR_ROLES);
        await dbConnect();
        const settings = await PlatformSettings.findOneAndUpdate(
            { key: 'default' },
            {},
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return NextResponse.json(settings);
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// PATCH /api/registrar/settings — update institution-wide settings.
// =============================================================================
const patchSchema = z.object({
    institutionName: z.string().min(1).max(200).optional(),
    academicYear: z.string().min(1).max(20).optional(),
});

export const PATCH = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, REGISTRAR_ROLES);

        const json = await req.json().catch(() => null);
        const parsed = patchSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        await dbConnect();
        const settings = await PlatformSettings.findOneAndUpdate(
            { key: 'default' },
            { $set: parsed.data },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return NextResponse.json(settings);
    } catch (err) {
        return handleError(err);
    }
});
