import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import { scheduleClassForSession } from '@/lib/schedule-class';
import { withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

export const POST = withAuth<RouteParams>(async (_req, { auth, params }) => {
    try {
        const { id } = await params;
        await dbConnect();

        const session = await TimetableSession.findById(id);
        if (!session) {
            return NextResponse.json({ error: 'Timetable session not found' }, { status: 404 });
        }

        // Creating the Zoom meeting is an admin/course_registrar action —
        // instructors only start a class once it has already been created for them.
        if (!['admin', 'course_registrar'].includes(auth.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const result = await scheduleClassForSession(session);
        if (!result.ok) {
            const status = result.reason.includes('booked') ? 409 : 400;
            return NextResponse.json({ error: result.reason }, { status });
        }

        return NextResponse.json({ success: true, session: result.session, liveClass: result.liveClass, alreadyScheduled: result.alreadyScheduled });
    } catch (error: any) {
        console.error('Error scheduling Zoom class from timetable session:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
});
