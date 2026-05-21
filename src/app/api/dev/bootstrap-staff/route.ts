import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';
import { assertDevEndpointAllowed } from '@/lib/dev-only';
import { AuthError, type Role } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 100 });

const requestSchema = z.object({
    emailDomain: z.string().min(3).max(120).optional(),
    password: z.string().min(8).max(128).optional(),
});

type StaffSpec = {
    role: Role;
    localPart: string;
    displayName: string;
    portal: string;
};

const STAFF: readonly StaffSpec[] = [
    { role: 'admin',            localPart: 'admin',            displayName: 'Academy Admin',     portal: '/admin' },
    { role: 'registrar',        localPart: 'registrar',        displayName: 'Academy Registrar', portal: '/registrar' },
    { role: 'course_registrar', localPart: 'course-registrar', displayName: 'Course Registrar',  portal: '/course-registrar' },
    { role: 'finance',          localPart: 'finance',          displayName: 'Finance Manager',   portal: '/finance' },
];

const DEFAULT_DOMAIN = 'ashfordgray.dev';
const DEFAULT_PASSWORD = 'AcademyTest2026!';

type ProvisionResult = {
    role: Role;
    email: string;
    password: string;
    portal: string;
    created: boolean;
};

async function provisionStaff(
    spec: StaffSpec,
    emailDomain: string,
    password: string
): Promise<ProvisionResult> {
    const email = `${spec.localPart}@${emailDomain}`;
    const auth = adminAuth();

    let uid: string;
    let createdInFirebase = false;
    try {
        const existing = await auth.getUserByEmail(email);
        uid = existing.uid;
    } catch (err: any) {
        if (err?.code !== 'auth/user-not-found') throw err;
        const created = await auth.createUser({
            email,
            password,
            displayName: spec.displayName,
            emailVerified: true,
        });
        uid = created.uid;
        createdInFirebase = true;
    }

    const existingProfile = await User.findOne({ uid });
    if (!existingProfile) {
        await User.create({
            uid,
            email,
            displayName: spec.displayName,
            role: spec.role,
            emailVerified: true,
            emailVerifiedAt: new Date(),
        });
    } else {
        // Heal role if drifted, and make sure provisioned staff bypass OTP.
        let dirty = false;
        if (existingProfile.role !== spec.role) {
            existingProfile.role = spec.role;
            dirty = true;
        }
        if (!existingProfile.emailVerified) {
            existingProfile.emailVerified = true;
            existingProfile.emailVerifiedAt = new Date();
            dirty = true;
        }
        if (dirty) await existingProfile.save();
    }

    return {
        role: spec.role,
        email,
        password,
        portal: spec.portal,
        created: createdInFirebase,
    };
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
        await limiter.check(null, 3, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const emailDomain = parsed.data.emailDomain || DEFAULT_DOMAIN;
    const password = parsed.data.password || DEFAULT_PASSWORD;

    try {
        await dbConnect();
        const results = [];
        for (const spec of STAFF) {
            results.push(await provisionStaff(spec, emailDomain, password));
        }
        return NextResponse.json({
            message:
                'Staff accounts ready. Sign in at /login with any of the credentials below.',
            credentials: results,
        });
    } catch (err: any) {
        console.error('bootstrap-staff failed:', err);
        return NextResponse.json(
            { error: err?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
