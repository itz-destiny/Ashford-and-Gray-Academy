import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import Course from '@/models/Course';
import User from '@/models/User';
import { withAuth } from '@/lib/auth-server';

type RouteParams = { params: Promise<{ id: string }> };

const patchSchema = z.object({
    instructorUid: z.string().optional(),
    courseId: z.string().optional(),
    programmeName: z.string().optional(),
    module: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    status: z.enum(['unassigned', 'assigned', 'scheduled', 'completed', 'cancelled']).optional(),
    notes: z.string().optional(),
});

export const PATCH = withAuth<RouteParams>(async (req, { auth, params }) => {
    try {
        if (auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        const { id } = await params;
        const body = patchSchema.parse(await req.json());
        await dbConnect();

        const session = await TimetableSession.findById(id);
        if (!session) {
            return NextResponse.json({ error: 'Timetable session not found' }, { status: 404 });
        }

        if (body.instructorUid !== undefined) {
            const instructor = await User.findOne({ uid: body.instructorUid }).lean<{ email: string; displayName: string } | null>();
            if (!instructor) {
                return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
            }
            session.instructorUid = body.instructorUid;
            session.instructorEmail = instructor.email;
            session.lecturerName = instructor.displayName;
        }
        if (body.courseId !== undefined) {
            const course = await Course.findById(body.courseId).select('title').lean<{ title: string } | null>();
            if (!course) {
                return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }
            session.courseId = body.courseId;
            session.courseTitle = course.title;
        }
        if (body.programmeName !== undefined) session.programmeName = body.programmeName;
        if (body.module !== undefined) session.module = body.module;
        if (body.startTime !== undefined) {
            session.startTime = new Date(body.startTime);
            session.date = new Date(body.startTime);
        }
        if (body.endTime !== undefined) session.endTime = new Date(body.endTime);
        if (body.status !== undefined) session.status = body.status;
        if (body.notes !== undefined) session.notes = body.notes;

        await session.save();
        return NextResponse.json({ success: true, session });
    } catch (error: any) {
        if (error?.issues) {
            return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});

export const DELETE = withAuth<RouteParams>(async (_req, { auth, params }) => {
    try {
        if (auth.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        const { id } = await params;
        await dbConnect();
        const deleted = await TimetableSession.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Timetable session not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
