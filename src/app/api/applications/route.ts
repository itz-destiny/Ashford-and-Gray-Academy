import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { rateLimit } from '@/lib/rate-limit';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

const applicationSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional(),
    country: z.string().max(120).optional(),
    dateOfBirth: z.string().max(40).optional(),
    programmeOfInterest: z.string().max(200).optional(),
    highestQualification: z.string().max(120).optional(),
    professionalBackground: z.string().max(2000).optional(),
    applicationStatement: z.string().max(3000).optional(),
});

function randomThrowawayPassword(): string {
    return crypto.randomBytes(24).toString('base64url');
}

/**
 * POST /api/applications — public. Creates a student account with no
 * user-chosen password: applying should never grant a usable login on its
 * own. The account is signed into silently via a custom token so the caller
 * can proceed straight to course checkout; a real password is only issued by
 * email once payment succeeds (see finalizeSuccessfulPayment).
 */
export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    try {
        await limiter.check(null, 10, ip);
    } catch {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await req.json().catch(() => null);
    const parsed = applicationSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }
    const body = parsed.data;

    try {
        await dbConnect();

        const existing = await User.findOne({ email: body.email });
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please sign in instead.' },
                { status: 409 }
            );
        }

        const auth = adminAuth();
        const fbUser = await auth.createUser({
            email: body.email,
            password: randomThrowawayPassword(),
            displayName: body.name,
            emailVerified: true,
        });

        await User.create({
            uid: fbUser.uid,
            email: body.email,
            displayName: body.name,
            role: 'student',
            phone: body.phone,
            country: body.country,
            dateOfBirth: body.dateOfBirth,
            programmeOfInterest: body.programmeOfInterest,
            highestQualification: body.highestQualification,
            professionalBackground: body.professionalBackground,
            applicationStatement: body.applicationStatement,
            emailVerified: true,
            emailVerifiedAt: new Date(),
        });

        const customToken = await auth.createCustomToken(fbUser.uid);

        return NextResponse.json({ customToken }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/applications failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
