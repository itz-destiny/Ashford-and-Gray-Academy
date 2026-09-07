import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import Course from '@/models/Course';
import User from '@/models/User';
import { withAuth } from '@/lib/auth-server';

const TIMETABLE_ROLES = ['admin', 'course_registrar'];

export const GET = withAuth(async (req, { auth }) => {
    try {
        if (!TIMETABLE_ROLES.includes(auth.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const week = searchParams.get('week');
        const instructorUid = searchParams.get('instructorUid');
        const courseId = searchParams.get('courseId');
        const status = searchParams.get('status');

        const filter: Record<string, unknown> = {};
        if (week) filter.weekCode = week;
        if (instructorUid) filter.instructorUid = instructorUid;
        if (courseId) filter.courseId = courseId;
        if (status) filter.status = status;

        const sessions = await TimetableSession.find(filter).sort({ startTime: 1 });
        return NextResponse.json({ success: true, sessions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});

const createSchema = z.object({
    courseId: z.string().min(1),
    instructorUid: z.string().optional(),
    module: z.string().min(1).max(200),
    startTime: z.string().datetime(),
    durationMinutes: z.number().min(15).max(300),
});

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// =============================================================================
// POST /api/admin/timetable — create a brand-new session outside the
// imported master workbook (e.g. a one-off or test class). This is the only
// way a new class comes into existence — instructors never create their own;
// they only start a class that's already been scheduled here.
// =============================================================================
export const POST = withAuth(async (req, { auth }) => {
    try {
        if (!TIMETABLE_ROLES.includes(auth.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = createSchema.parse(await req.json());
        await dbConnect();

        const course = await Course.findById(body.courseId).select('title').lean<{ title: string } | null>();
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        let instructor: { uid: string; email: string; displayName: string } | null = null;
        if (body.instructorUid) {
            instructor = await User.findOne({ uid: body.instructorUid, role: 'instructor' }).lean<{ uid: string; email: string; displayName: string } | null>();
            if (!instructor) {
                return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
            }
        }

        const startTime = new Date(body.startTime);
        const endTime = new Date(startTime.getTime() + body.durationMinutes * 60_000);
        const sessionCode = `ADHOC-${startTime.getTime()}`;

        const session = await TimetableSession.create({
            weekCode: 'ADHOC',
            day: DAY_NAMES[startTime.getDay()],
            sessionCode,
            date: startTime,
            startTime,
            endTime,
            programmeName: course.title,
            courseId: body.courseId,
            courseTitle: course.title,
            module: body.module,
            lecturerName: instructor?.displayName || 'Unassigned',
            instructorUid: instructor?.uid,
            instructorEmail: instructor?.email,
            status: instructor ? 'assigned' : 'unassigned',
        });

        return NextResponse.json({ success: true, session });
    } catch (error: any) {
        if (error?.issues) {
            return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
