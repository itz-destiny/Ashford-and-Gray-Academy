import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { adminAuth } from '@/lib/firebase-admin';
import { generateTempPassword } from '@/lib/generate-password';
import { sendEmail, emailTemplates } from '@/lib/email';
import { getEmailUrl } from '@/lib/app-url';
import { rateLimit } from '@/lib/rate-limit';
import { totalMonitorSlots } from '@/lib/monitor-slots';

const ASSIGNABLE_ROLES = ['student', 'instructor', 'course_registrar', 'finance', 'registrar', 'admissions_officer', 'admin', 'live_monitor'] as const;

const ROLE_TITLES: Record<string, string> = {
    instructor: 'Instructor',
    course_registrar: 'Course Registrar',
    finance: 'Finance Officer',
    registrar: 'Registrar',
    admissions_officer: 'Admissions Officer',
    admin: 'Administrator',
    live_monitor: 'Live Class Monitor',
};

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admin/users route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// POST /api/admin/users — create any-role account: real Firebase Auth user,
// real Mongo profile, real emailed credentials. Server-side equivalent of
// /api/registrar/staff, extended to also cover 'student' and 'admin'
// (registrar/staff intentionally excludes those). This replaces the old
// client-side `createUserWithEmailAndPassword` flow on the admin Users page,
// which required the admin to type a plaintext password into a form and
// juggle a secondary Firebase app instance to avoid signing themself out.
// =============================================================================
const createSchema = z.object({
    displayName: z.string().min(1).max(120),
    email: z.string().email(),
    role: z.enum(ASSIGNABLE_ROLES),
    monitorSlotIndex: z.number().int().min(1).optional(),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin']);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 20, ip);
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const json = await req.json().catch(() => null);
        const parsed = createSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const { displayName, email, role } = parsed.data;
        let { monitorSlotIndex } = parsed.data;

        await dbConnect();

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        if (role === 'live_monitor') {
            const totalSlots = totalMonitorSlots();
            if (!monitorSlotIndex) {
                return NextResponse.json({ error: 'A monitor slot number is required for this role.' }, { status: 400 });
            }
            if (monitorSlotIndex > totalSlots) {
                return NextResponse.json({ error: `Only ${totalSlots} monitor slot(s) are currently configured (this platform's real concurrent Zoom capacity).` }, { status: 400 });
            }
            const slotTaken = await User.findOne({ role: 'live_monitor', monitorSlotIndex }).lean();
            if (slotTaken) {
                return NextResponse.json({ error: `Slot ${monitorSlotIndex} is already assigned to another monitor account.` }, { status: 409 });
            }
        } else {
            monitorSlotIndex = undefined;
        }

        const password = generateTempPassword(displayName);
        const auth_ = adminAuth();

        let fbUid: string;
        try {
            const fbUser = await auth_.createUser({ email, password, displayName, emailVerified: true });
            fbUid = fbUser.uid;
        } catch (err: any) {
            if (err?.errorInfo?.code === 'auth/email-already-exists') {
                const fbUser = await auth_.getUserByEmail(email);
                await auth_.updateUser(fbUser.uid, { password });
                fbUid = fbUser.uid;
            } else {
                throw err;
            }
        }

        const created = await User.create({
            uid: fbUid,
            email,
            displayName,
            role,
            monitorSlotIndex,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            mustChangePassword: true,
        });

        try {
            const appUrl = getEmailUrl();
            const loginUrl = `${appUrl}/login`;
            const roleTitle = role === 'live_monitor' ? `${ROLE_TITLES[role]} — Slot ${monitorSlotIndex}` : (ROLE_TITLES[role] || 'Staff Member');
            const tpl = role === 'student'
                ? emailTemplates.enrollmentWelcome({ recipientName: displayName, email, password, loginUrl })
                : emailTemplates.staffWelcome({ recipientName: displayName, email, password, loginUrl, roleTitle });
            void sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
        } catch (mailErr) {
            console.warn('admin/users welcome email skipped:', mailErr);
        }

        return NextResponse.json({ user: created }, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
});
