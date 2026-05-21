import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Registration from '@/models/Registration';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

// GET /api/events — public; lists all events with registration counts.
export async function GET(): Promise<Response> {
    try {
        await dbConnect();
        const [events, registrations] = await Promise.all([
            Event.find({}),
            Registration.find({}),
        ]);

        const counts: Record<string, number> = {};
        for (const reg of registrations) {
            if (!reg.eventId) continue;
            const eid = reg.eventId.toString();
            counts[eid] = (counts[eid] || 0) + 1;
        }

        const result = events.map(event => ({
            ...event.toObject(),
            id: event._id.toString(),
            registrationCount: counts[event._id.toString()] || 0,
        }));
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('GET /api/events failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

const createSchema = z.object({
    title: z.string().min(1).max(300),
    category: z.string().min(1).max(120),
    date: z.string().min(1),
    location: z.string().min(1).max(300),
    price: z.number().min(0).optional(),
    imageUrl: z.string().min(1).max(500),
    imageHint: z.string().min(1).max(200),
    organizer: z.string().min(1).max(300),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'registrar', 'course_registrar']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    const json = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const event = await Event.create(parsed.data);
        return NextResponse.json(event, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/events failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
