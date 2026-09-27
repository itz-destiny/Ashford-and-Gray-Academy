import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (_req, { auth }) => {
    try {
        await dbConnect();

        if (auth.role === 'student') {
            const enrollments = await Enrollment.find({ userId: auth.uid }).select('courseId').lean<{ courseId: unknown }[]>();
            const courseIds = enrollments.map((e) => String(e.courseId));
            if (courseIds.length === 0) {
                return NextResponse.json({ success: true, sessions: [] });
            }
            // Some sessions are shared between two cohorts at once (see
            // TimetableSession.programmeName, e.g. "Hospitality Management &
            // Food and Beverage Management") but only carry one courseId —
            // match those in too, by the student's other enrolled course
            // title appearing in that joint programme name, so the session
            // shows up on both cohorts' schedules, not just the primary one.
            const enrolledCourses = await Course.find({ _id: { $in: courseIds } }).select('title').lean<{ title: string }[]>();
            const jointNameMatches = enrolledCourses.map((c) => new RegExp(c.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

            const sessions = await TimetableSession.find({
                $or: [
                    { courseId: { $in: courseIds } },
                    { courseId: { $exists: false } },
                    { courseId: null },
                    ...(jointNameMatches.length ? [{ programmeName: { $in: jointNameMatches } }] : []),
                ],
            }).sort({ startTime: 1 });
            return NextResponse.json({ success: true, sessions });
        }

        if (!['instructor', 'admin'].includes(auth.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        const sessions = await TimetableSession.find({ instructorUid: auth.uid }).sort({ startTime: 1 });
        return NextResponse.json({ success: true, sessions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
});
