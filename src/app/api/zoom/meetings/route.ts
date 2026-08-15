import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { createZoomMeeting } from '@/lib/zoom';
import { findAvailableZoomHost } from '@/lib/zoom-scheduler';
import { withAuth } from '@/lib/auth-server';
import { z } from 'zod';

const createMeetingSchema = z.object({
    courseId: z.string(),
    topic: z.string(),
    description: z.string().optional(),
    startTime: z.string().datetime(),
    durationMinutes: z.number().min(15).max(300)
});

export const POST = withAuth(async (req, { auth }) => {
    try {
        if (!['admin', 'instructor'].includes(auth.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const parsed = createMeetingSchema.parse(body);

        await dbConnect();

        // Optional: verify instructor manages this course
        // if (auth.role === 'instructor') { ... }

        const startTime = new Date(parsed.startTime);
        const assignment = await findAvailableZoomHost(startTime, parsed.durationMinutes);
        if (!assignment) {
            return NextResponse.json(
                { error: 'Every licensed Zoom host is already booked for this time. Please choose a different time, or add another Zoom license.' },
                { status: 409 }
            );
        }

        // Create Zoom meeting via API, under whichever host is free
        const zoomResponse = await createZoomMeeting({
            topic: parsed.topic,
            agenda: parsed.description,
            startTime: parsed.startTime,
            durationMinutes: parsed.durationMinutes,
            hostEmail: assignment.hostEmail,
            account: assignment.account,
        });

        // Save to Database
        const liveClass = await LiveClass.create({
            courseId: parsed.courseId,
            instructorId: auth.uid,
            topic: parsed.topic,
            description: parsed.description,
            startTime,
            durationMinutes: parsed.durationMinutes,
            zoomMeetingId: zoomResponse.id.toString(),
            zoomJoinUrl: zoomResponse.join_url,
            zoomStartUrl: zoomResponse.start_url,
            zoomHostEmail: assignment.hostEmail,
            zoomAccountKey: assignment.account.key,
            status: 'scheduled'
        });

        return NextResponse.json({ success: true, liveClass });

    } catch (error: any) {
        console.error('Error creating Zoom meeting:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
});
