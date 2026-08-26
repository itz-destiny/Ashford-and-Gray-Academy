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

const REGISTRAR_ROLES = ['admin', 'registrar'] as const;
const ASSIGNABLE_ROLES = ['instructor', 'course_registrar', 'finance', 'registrar'] as const;

const ROLE_TITLES: Record<string, string> = {
    instructor: 'Instructor',
    course_registrar: 'Course Registrar',
    finance: 'Finance Officer',
    registrar: 'Registrar',
};

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('registrar/staff route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// POST /api/registrar/staff — hire a new staff member: creates the Firebase
// account, the Mongo profile, and emails their login credentials.
// =============================================================================
const createSchema = z.object({
    displayName: z.string().min(1).max(120),
    email: z.string().email(),
    role: z.enum(ASSIGNABLE_ROLES),
    title: z.string().max(200).optional(),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, REGISTRAR_ROLES);

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
        const { displayName, email, role, title } = parsed.data;

        await dbConnect();

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            return NextResponse.json({ error: 'A staff member with this email already exists.' }, { status: 409 });
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

        const staff = await User.create({
            uid: fbUid,
            email,
            displayName,
            role,
            title,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            mustChangePassword: true,
        });

        try {
            const appUrl = getEmailUrl();
            const tpl = emailTemplates.staffWelcome({
                recipientName: displayName,
                email,
                password,
                loginUrl: `${appUrl}/login`,
                roleTitle: title || ROLE_TITLES[role] || 'Staff Member',
            });
            void sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
        } catch (mailErr) {
            console.warn('staffWelcome email skipped:', mailErr);
        }

        return NextResponse.json({ staff }, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
});
