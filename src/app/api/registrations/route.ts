import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { withAuth, type AuthContext } from '@/lib/auth-server';

const ELEVATED_ROLES = ['admin', 'instructor', 'registrar', 'course_registrar'] as const;

function isElevated(auth: AuthContext): boolean {
    return (ELEVATED_ROLES as readonly string[]).includes(auth.role);
}

export const GET = withAuth(async (req: NextRequest, { auth }) => {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    const targetUserId = requestedUserId ?? auth.uid;
    if (targetUserId !== auth.uid && !isElevated(auth)) {
        return NextResponse.json(
            { error: 'You can only read your own registrations.' },
            { status: 403 }
        );
    }

    try {
        await dbConnect();
        const registrations = await Registration.find({ userId: targetUserId })
            .populate('eventId')
            .exec();

        const formatted = registrations.map(reg => ({
            id: reg._id,
            userId: reg.userId,
            eventId: reg.eventId?._id,
            registeredAt: reg.registeredAt,
            event: reg.eventId,
        }));
        return NextResponse.json(formatted);
    } catch (error: any) {
        console.error('GET /api/registrations failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});

const postSchema = z.object({
    eventId: z.string().min(1),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    const json = await req.json().catch(() => null);
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const userId = auth.uid;
        const { eventId } = parsed.data;

        const existing = await Registration.findOne({ userId, eventId });
        if (existing) {
            return NextResponse.json({ message: 'Already registered', registration: existing });
        }

        const registration = await Registration.create({ userId, eventId });
        return NextResponse.json(registration, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/registrations failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
