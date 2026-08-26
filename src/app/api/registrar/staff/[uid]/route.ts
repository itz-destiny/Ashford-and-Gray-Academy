import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { adminAuth } from '@/lib/firebase-admin';

type RouteParams = { params: Promise<{ uid: string }> };

const REGISTRAR_ROLES = ['admin', 'registrar'] as const;
const ASSIGNABLE_ROLES = ['instructor', 'course_registrar', 'finance', 'registrar'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('registrar/staff/[uid] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// PATCH /api/registrar/staff/[uid] — edit a staff member's credentials.
// =============================================================================
const patchSchema = z.object({
    displayName: z.string().min(1).max(120).optional(),
    email: z.string().email().optional(),
    role: z.enum(ASSIGNABLE_ROLES).optional(),
    title: z.string().max(200).optional(),
});

export const PATCH = withAuth<RouteParams>(async (request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, REGISTRAR_ROLES);

        const { uid } = await params;
        const json = await request.json().catch(() => null);
        const parsed = patchSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        await dbConnect();
        const staff = await User.findOne({ uid });
        if (!staff) {
            return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
        }
        if (staff.role === 'admin') {
            return NextResponse.json({ error: 'Super Admin accounts cannot be edited here.' }, { status: 403 });
        }

        const { displayName, email, role, title } = parsed.data;

        if (email && email !== staff.email) {
            const emailTaken = await User.findOne({ email, uid: { $ne: uid } }).lean();
            if (emailTaken) {
                return NextResponse.json({ error: 'Another account already uses that email.' }, { status: 409 });
            }
        }

        if (displayName || email) {
            await adminAuth().updateUser(uid, {
                ...(displayName ? { displayName } : {}),
                ...(email ? { email } : {}),
            });
        }

        if (displayName !== undefined) staff.displayName = displayName;
        if (email !== undefined) staff.email = email;
        if (role !== undefined) staff.role = role;
        if (title !== undefined) staff.title = title;
        await staff.save();

        return NextResponse.json(staff);
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// DELETE /api/registrar/staff/[uid] — revoke a staff member's access entirely.
// =============================================================================
export const DELETE = withAuth<RouteParams>(async (_request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, REGISTRAR_ROLES);

        const { uid } = await params;
        await dbConnect();

        const staff = await User.findOne({ uid });
        if (!staff) {
            return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
        }
        if (staff.role === 'admin') {
            return NextResponse.json({ error: 'Super Admin accounts cannot be removed.' }, { status: 403 });
        }

        await User.deleteOne({ uid });
        try {
            await adminAuth().deleteUser(uid);
        } catch (fbErr) {
            console.warn('Firebase user delete skipped:', fbErr);
        }

        return NextResponse.json({ message: 'Staff access revoked successfully' });
    } catch (err) {
        return handleError(err);
    }
});
