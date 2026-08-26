import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import Course from '@/models/Course';
import User from '@/models/User';
import { withAuth, requireRole } from '@/lib/auth-server';
import mongoose from 'mongoose';

// =============================================================================
// GET /api/live-classes/mine — every live class the calling instructor has
// hosted, most recent first, with each attendee's real name resolved and a
// convenience `enrolledCount` so the UI can show "6 of 12 attended" per class.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['instructor', 'admin']);
        await dbConnect();

        const classes = await LiveClass.find({ instructorId: auth.uid })
            .sort({ startTime: -1 })
            .lean();

        const attendeeUids = Array.from(
            new Set(classes.flatMap((c: any) => (c.attendees || []).map((a: any) => a.userId).filter(Boolean)))
        );
        const users = attendeeUids.length
            ? await User.find({ uid: { $in: attendeeUids } }).select('uid displayName email').lean()
            : [];
        const userByUid = new Map(users.map((u: any) => [u.uid, u]));

        const courseIds = Array.from(new Set(classes.map((c: any) => c.courseId).filter(Boolean)));
        const courses = courseIds.length
            ? await Course.find({ _id: { $in: courseIds } }).select('title').lean()
            : [];
        const enrollmentCounts = new Map<string, number>();
        if (courseIds.length) {
            const Enrollment = (await import('@/models/Enrollment')).default;
            const validIds = courseIds.filter((id: any) => mongoose.Types.ObjectId.isValid(id));
            const counts = await Enrollment.aggregate([
                { $match: { courseId: { $in: validIds.map((id: any) => new mongoose.Types.ObjectId(id)) } } },
                { $group: { _id: '$courseId', count: { $sum: 1 } } },
            ]);
            for (const c of counts) enrollmentCounts.set(String(c._id), c.count);
        }
        const courseTitleById = new Map(courses.map((c: any) => [String(c._id), c.title]));

        const enriched = classes.map((c: any) => ({
            ...c,
            courseTitle: courseTitleById.get(String(c.courseId)) || null,
            enrolledCount: enrollmentCounts.get(String(c.courseId)) || 0,
            attendees: (c.attendees || []).map((a: any) => ({
                ...a,
                displayName: userByUid.get(a.userId)?.displayName || a.email || a.userId,
            })),
        }));

        return NextResponse.json({ success: true, classes: enriched });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error.status || 500 });
    }
});
