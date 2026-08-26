import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { withAuth } from '@/lib/auth-server';

// =============================================================================
// GET /api/live-classes/my-attendance — every class already run for courses
// the calling student is enrolled in, with whether they actually attended.
// Only classes whose scheduled time has already passed count toward the
// summary — a class still ahead of it isn't something you could have missed.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();

        const enrollments = await Enrollment.find({ userId: auth.uid }).select('courseId').lean();
        const courseIds = enrollments.map((e: any) => String(e.courseId));
        if (courseIds.length === 0) {
            return NextResponse.json({ success: true, summary: { total: 0, attended: 0, missed: 0 }, classes: [] });
        }

        const courses = await Course.find({ _id: { $in: courseIds } }).select('title').lean();
        const courseTitleById = new Map(courses.map((c: any) => [String(c._id), c.title]));

        const allClasses = await LiveClass.find({ courseId: { $in: courseIds } }).sort({ startTime: -1 }).lean();
        const now = Date.now();

        const past = allClasses.filter((c: any) => {
            const endTime = new Date(c.startTime).getTime() + (c.durationMinutes || 60) * 60000;
            return endTime < now && c.status !== 'cancelled';
        });

        const classes = past.map((c: any) => {
            const attended = (c.attendees || []).some((a: any) => a.userId === auth.uid);
            return {
                _id: c._id,
                courseTitle: courseTitleById.get(String(c.courseId)) || null,
                topic: c.topic,
                startTime: c.startTime,
                durationMinutes: c.durationMinutes,
                attended,
            };
        });

        const attended = classes.filter((c) => c.attended).length;

        return NextResponse.json({
            success: true,
            summary: { total: classes.length, attended, missed: classes.length - attended },
            classes,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
});
