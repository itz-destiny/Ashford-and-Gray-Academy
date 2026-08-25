import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { adminAuth } from '@/lib/firebase-admin';

type RouteParams = { params: Promise<{ uid: string }> };

const ADMISSIONS_ROLES = ['admin', 'registrar', 'admissions_officer'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admissions/students/[uid] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// PATCH /api/admissions/students/[uid] — edit a student's profile fields.
// =============================================================================
const patchSchema = z.object({
    displayName: z.string().min(1).max(120).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(40).optional(),
    country: z.string().max(120).optional(),
});

export const PATCH = withAuth<RouteParams>(async (request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ADMISSIONS_ROLES);

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
        const student = await User.findOne({ uid });
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }
        if (student.role !== 'student') {
            return NextResponse.json({ error: 'This account is not a student profile.' }, { status: 403 });
        }

        const { displayName, email, phone, country } = parsed.data;

        if (email && email !== student.email) {
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

        if (displayName !== undefined) student.displayName = displayName;
        if (email !== undefined) student.email = email;
        if (phone !== undefined) student.phone = phone;
        if (country !== undefined) student.country = country;
        await student.save();

        return NextResponse.json(student);
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// DELETE /api/admissions/students/[uid] — remove a student account entirely:
// Firebase auth user, Mongo profile, and every enrollment record.
// =============================================================================
export const DELETE = withAuth<RouteParams>(async (_request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ADMISSIONS_ROLES);

        const { uid } = await params;
        await dbConnect();

        const student = await User.findOne({ uid });
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }
        if (student.role !== 'student') {
            return NextResponse.json({ error: 'Only student accounts can be removed here.' }, { status: 403 });
        }

        await Enrollment.deleteMany({ userId: uid });
        await User.deleteOne({ uid });
        try {
            await adminAuth().deleteUser(uid);
        } catch (fbErr) {
            console.warn('Firebase user delete skipped:', fbErr);
        }

        return NextResponse.json({ message: 'Student account deleted successfully' });
    } catch (err) {
        return handleError(err);
    }
});
