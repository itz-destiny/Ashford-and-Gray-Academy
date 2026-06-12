import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { rateLimit } from '@/lib/rate-limit';
import {
    AuthError,
    authenticateFirebase,
    requireRole,
    withAuth,
    type AuthContext,
    type Role,
} from '@/lib/auth-server';

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

const ELEVATED_ROLES: readonly Role[] = ['admin', 'instructor', 'registrar', 'course_registrar'];

function isElevated(auth: AuthContext): boolean {
    return ELEVATED_ROLES.includes(auth.role);
}

function handleAuthError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('users route: unexpected error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

async function loadProfile(uid: string): Promise<AuthContext | null> {
    await dbConnect();
    const profile = await User.findOne({ uid }).lean<{
        uid: string;
        email: string;
        displayName: string;
        role: Role;
    } | null>();
    if (!profile) return null;
    return {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        role: profile.role,
    };
}

// =============================================================================
// GET /api/users
//   ?uid=<self>: only Firebase auth required (signup probe — Mongo profile may
//                 not exist yet; returns 404 in that case).
//   ?uid=<other>: requires Mongo profile with elevated role.
//   ?role=<r> / list: requires Mongo profile with elevated role.
// =============================================================================
export async function GET(req: NextRequest): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const uid = searchParams.get('uid');
        const roleParam = searchParams.get('role');

        if (uid && !roleParam) {
            const identity = await authenticateFirebase(req);
            if (uid !== identity.uid) {
                const caller = await loadProfile(identity.uid);
                if (!caller || !isElevated(caller)) {
                    return NextResponse.json(
                        { error: 'You can only read your own profile.' },
                        { status: 403 }
                    );
                }
            }
            let dbOk = false;
            let user = null;
            try {
                await dbConnect();
                dbOk = true;
                user = await User.findOne({ uid });
            } catch (dbErr) {
                console.warn('GET Users DB connection failed. Falling back to fail-safe profile:', dbErr);
            }

            if (!dbOk || !user) {
                return NextResponse.json({
                    uid: uid,
                    email: identity.email || 'student@academy.com',
                    displayName: identity.email?.split('@')[0] || 'Student',
                    role: 'student',
                    createdAt: new Date().toISOString(),
                });
            }
            return NextResponse.json(user);
        }

        // Listing modes require elevated role with full profile loaded.
        return withAuth(async (_req, { auth }) => {
            if (!isElevated(auth)) {
                return NextResponse.json(
                    { error: 'Requires an elevated role to list users.' },
                    { status: 403 }
                );
            }
            await dbConnect();
            const query: Record<string, unknown> = {};
            if (roleParam === 'staff') {
                query.role = {
                    $in: ['registrar', 'course_registrar', 'finance', 'admin', 'instructor'],
                };
            } else if (roleParam) {
                query.role = roleParam;
            }
            const users = await User.find(query).sort({ createdAt: -1 });
            return NextResponse.json(users);
        })(req, {});
    } catch (err) {
        return handleAuthError(err);
    }
}

// =============================================================================
// POST /api/users — upsert self profile.
//   Firebase auth only (signup boundary). body.uid must match the verified
//   Firebase UID. Role changes on existing profiles require admin.
// =============================================================================
const upsertSchema = z.object({
    uid: z.string().min(1),
    email: z.string().email(),
    displayName: z.string().min(1).max(120).optional(),
    photoURL: z.string().url().optional().or(z.literal('')),
    role: z
        .enum(['student', 'instructor', 'admin', 'registrar', 'course_registrar', 'finance'])
        .optional(),
    bio: z.string().max(2000).optional(),
    title: z.string().max(200).optional(),
    school: z.string().max(200).optional(),
    dateOfBirth: z.string().max(40).optional(),
    expertise: z.string().max(500).optional(),
    organization: z.string().max(200).optional(),
    phone: z.string().max(40).optional(),
    country: z.string().max(120).optional(),
    programmeOfInterest: z.string().max(200).optional(),
    highestQualification: z.string().max(120).optional(),
    professionalBackground: z.string().max(2000).optional(),
    applicationStatement: z.string().max(3000).optional(),
});

export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    try {
        await limiter.check(null, 10, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let identity;
    try {
        identity = await authenticateFirebase(req);
    } catch (err) {
        return handleAuthError(err);
    }

    const json = await req.json().catch(() => null);
    const parsed = upsertSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }
    const body = parsed.data;

    // Two paths share this handler:
    //   (a) self-upsert: body.uid matches the Firebase token; no role lookup
    //       required (the user may be bootstrapping their own profile).
    //   (b) admin upsert: body.uid is somebody else, in which case the caller
    //       must be an admin (verified via Mongo lookup).
    let callerIsAdmin = false;
    if (body.uid !== identity.uid) {
        const caller = await loadProfile(identity.uid);
        if (caller?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only an admin may upsert another user.' },
                { status: 403 }
            );
        }
        callerIsAdmin = true;
    }

    let dbOk = false;
    try {
        await dbConnect();
        dbOk = true;
    } catch (dbErr) {
        console.warn('POST User Sync: Database connection failed. Falling back to dynamic mock upsert:', dbErr);
    }

    if (!dbOk) {
        return NextResponse.json({
            uid: body.uid,
            email: body.email,
            displayName: body.displayName || body.email?.split('@')[0] || 'Student',
            role: body.role || 'student',
            school: body.school,
            dateOfBirth: body.dateOfBirth,
            emailVerified: false,
            createdAt: new Date().toISOString(),
        });
    }

    try {
        const existing = await User.findOne({ uid: body.uid });

        const updateData: Record<string, unknown> = {
            uid: body.uid,
            email: body.email,
            displayName: body.displayName ?? existing?.displayName ?? 'User',
            photoURL: body.photoURL || existing?.photoURL,
            bio: body.bio ?? existing?.bio,
            title: body.title ?? existing?.title,
            school: body.school ?? existing?.school,
            dateOfBirth: body.dateOfBirth ?? existing?.dateOfBirth,
            expertise: body.expertise ?? existing?.expertise,
            organization: body.organization ?? existing?.organization,
            phone: body.phone ?? existing?.phone,
            country: body.country ?? existing?.country,
            programmeOfInterest: body.programmeOfInterest ?? existing?.programmeOfInterest,
            highestQualification: body.highestQualification ?? existing?.highestQualification,
            professionalBackground: body.professionalBackground ?? existing?.professionalBackground,
            applicationStatement: body.applicationStatement ?? existing?.applicationStatement,
        };

        // Email verification is not required to use the academy (frictionless
        // signup for Phase-1 marketing). Every newly created profile is marked
        // verified; a welcome email is sent after the upsert below.
        if (!existing) {
            updateData.emailVerified = true;
            updateData.emailVerifiedAt = new Date();
        }

        if (body.role) {
            const requestedRole = body.role;
            if (callerIsAdmin) {
                // Admin may assign any role, but cannot downgrade an existing admin.
                if (existing?.role === 'admin' && requestedRole !== 'admin') {
                    return NextResponse.json(
                        { error: 'Super Admin roles cannot be downgraded.' },
                        { status: 403 }
                    );
                }
                updateData.role = requestedRole;
            } else if (!existing) {
                // Public signup only permits the `student` role. Instructors,
                // registrars, course_registrars, finance, and admins are
                // created by an admin via the admin upsert path (handled in
                // the callerIsAdmin branch above).
                if (requestedRole !== 'student') {
                    return NextResponse.json(
                        { error: `Role "${requestedRole}" cannot be self-assigned. Contact an administrator.` },
                        { status: 403 }
                    );
                }
                updateData.role = requestedRole;
            } else if (existing.role !== requestedRole) {
                if (existing.role === 'admin' && requestedRole !== 'admin') {
                    return NextResponse.json(
                        { error: 'Super Admin roles cannot be downgraded.' },
                        { status: 403 }
                    );
                }
                // Self-upsert can't change its own role outside admin.
                return NextResponse.json(
                    { error: 'Only an admin can change a user role.' },
                    { status: 403 }
                );
            }
            // else: same as existing -> no-op
        }

        const user = await User.findOneAndUpdate(
            { uid: body.uid },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Welcome a brand-new self-service registration. Best-effort — never
        // blocks the response.
        if (!existing && user?.email) {
            try {
                const { getAppUrl } = await import('@/lib/app-url');
                const { sendEmail, emailTemplates } = await import('@/lib/email');
                const appUrl = getAppUrl();
                const portalByRole: Record<string, string> = {
                    admin: '/admin', registrar: '/registrar', course_registrar: '/course-registrar',
                    finance: '/finance', instructor: '/instructor', student: '/dashboard',
                };
                const portal = portalByRole[user.role] || '/dashboard';
                const tpl = emailTemplates.welcome({
                    recipientName: user.displayName || 'there',
                    portalUrl: `${appUrl}${portal}`,
                    coursesUrl: `${appUrl}/courses`,
                });
                void sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
            } catch (mailErr) {
                console.warn('welcome email skipped:', mailErr);
            }
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('POST /api/users failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// =============================================================================
// DELETE /api/users?uid=X — admin only.
// =============================================================================
export const DELETE = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin']);
    } catch (err) {
        return handleAuthError(err);
    }

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const uid = searchParams.get('uid');
        if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

        const target = await User.findOne({ uid });
        if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (target.role === 'admin') {
            return NextResponse.json(
                { error: 'Super Admin accounts cannot be deleted.' },
                { status: 403 }
            );
        }

        await User.findOneAndDelete({ uid });
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('DELETE /api/users failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
