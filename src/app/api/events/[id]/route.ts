import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('events/[id] route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export const PATCH = withAuth<RouteParams>(async (request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ['admin', 'registrar', 'course_registrar']);
        const { id } = await params;
        await dbConnect();
        const body = await request.json();
        const event = await Event.findByIdAndUpdate(id, body, { new: true });
        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        return NextResponse.json(event);
    } catch (err) {
        return handleError(err);
    }
});

export const DELETE = withAuth<RouteParams>(async (_request: NextRequest, { auth, params }) => {
    try {
        requireRole(auth, ['admin', 'registrar', 'course_registrar']);
        const { id } = await params;
        await dbConnect();
        const event = await Event.findByIdAndDelete(id);
        if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (err) {
        return handleError(err);
    }
});
