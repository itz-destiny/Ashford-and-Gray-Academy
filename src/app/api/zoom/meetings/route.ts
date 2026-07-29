import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import { createZoomMeeting } from '@/lib/zoom';
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

        // Create Zoom meeting via API
        const zoomResponse = await createZoomMeeting({
            topic: parsed.topic,
            agenda: parsed.description,
            startTime: parsed.startTime,
            durationMinutes: parsed.durationMinutes
        });

        // Save to Database
        const liveClass = await LiveClass.create({
            courseId: parsed.courseId,
            instructorId: auth.uid,
            topic: parsed.topic,
            description: parsed.description,
            startTime: new Date(parsed.startTime),
            durationMinutes: parsed.durationMinutes,
            zoomMeetingId: zoomResponse.id.toString(),
            zoomJoinUrl: zoomResponse.join_url,
            zoomStartUrl: zoomResponse.start_url,
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
