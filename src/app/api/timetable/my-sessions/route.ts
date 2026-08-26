import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TimetableSession from '@/models/TimetableSession';
import Enrollment from '@/models/Enrollment';
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
            const sessions = await TimetableSession.find({
                $or: [
                    { courseId: { $in: courseIds } },
                    { courseId: { $exists: false } },
                    { courseId: null },
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
