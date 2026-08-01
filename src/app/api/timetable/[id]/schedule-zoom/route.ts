import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import LiveClass from '@/models/LiveClass';
import { createZoomMeeting } from '@/lib/zoom';
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

        const isOwner = session.instructorUid === auth.uid;
        if (!isOwner && auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (session.status === 'scheduled' && session.liveClassId) {
            const existing = await LiveClass.findById(session.liveClassId);
            if (existing) {
                return NextResponse.json({ success: true, session, liveClass: existing, alreadyScheduled: true });
            }
        }

        if (!session.courseId) {
            return NextResponse.json(
                { error: 'This session is not linked to a course yet. Ask an admin to fix the timetable mapping first.' },
                { status: 400 }
            );
        }

        const durationMinutes = Math.max(15, Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000));
        const topic = `${session.courseTitle || session.programmeName}: ${session.module}`;

        const zoomResponse = await createZoomMeeting({
            topic,
            agenda: session.programmeName,
            startTime: session.startTime.toISOString(),
            durationMinutes,
        });

        const liveClass = await LiveClass.create({
            courseId: session.courseId,
            instructorId: session.instructorUid,
            topic,
            description: session.module,
            startTime: session.startTime,
            durationMinutes,
            zoomMeetingId: zoomResponse.id.toString(),
            zoomJoinUrl: zoomResponse.join_url,
            zoomStartUrl: zoomResponse.start_url,
            status: 'scheduled',
        });

        session.status = 'scheduled';
        session.liveClassId = liveClass._id.toString();
        session.zoomJoinUrl = zoomResponse.join_url;
        session.zoomStartUrl = zoomResponse.start_url;
        await session.save();

        return NextResponse.json({ success: true, session, liveClass });
    } catch (error: any) {
        console.error('Error scheduling Zoom class from timetable session:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
});
