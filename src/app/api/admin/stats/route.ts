import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Event from '@/models/Event';
import Enrollment from '@/models/Enrollment';
import { Message, Submission } from '@/models/Supports';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'registrar']);
    } catch (err) {
        if (err instanceof AuthError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        throw err;
    }

    try {
        await dbConnect();

        const [studentCount, instructorCount, courseCount, eventCount, unreadMessages, ungradedSubmissions] =
            await Promise.all([
                User.countDocuments({ role: 'student' }),
                User.countDocuments({ role: 'instructor' }),
                Course.countDocuments({}),
                Event.countDocuments({}),
                Message.countDocuments({ isRead: false }),
                Submission.countDocuments({ grade: { $exists: false } }),
            ]);

        const recentEnrollmentsRaw = await Enrollment.find({}).sort({ enrolledAt: -1 }).limit(5);
        const courseIds = recentEnrollmentsRaw.map(en => en.courseId);
        const uids = recentEnrollmentsRaw.map(en => en.userId);
        const [courses, users] = await Promise.all([
            Course.find({ _id: { $in: courseIds } }),
            User.find({ uid: { $in: uids } }),
        ]);
        const courseMap = Object.fromEntries(courses.map(c => [c._id.toString(), c]));
        const userMap = Object.fromEntries(users.map(u => [u.uid, u]));

        const recentEnrollments = recentEnrollmentsRaw.map(en => {
            const user = userMap[en.userId];
            return {
                id: en._id.toString(),
                userId: en.userId,
                userName: user?.displayName || 'Unknown Student',
                userPhoto: user?.photoURL,
                course: courseMap[en.courseId.toString()] || { title: 'Unknown Course' },
                enrolledAt: en.enrolledAt,
                progress: en.progress,
            };
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendsRaw = await Enrollment.aggregate([
            { $match: { enrolledAt: { $gte: sevenDaysAgo } } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: '$course' },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' } },
                    enrollments: { $sum: 1 },
                    revenue: { $sum: { $ifNull: ['$course.price', 0] } },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const allEnrollments = await Enrollment.find({});
        const allCourses = await Course.find({});
        const priceMap = Object.fromEntries(allCourses.map(c => [c._id.toString(), c.price || 0]));
        const totalRevenue = allEnrollments.reduce(
            (sum, en) => sum + (priceMap[en.courseId.toString()] || 0),
            0
        );

        const needsAttention: { id: string; title: string; description: string; type: string }[] = [];
        if (unreadMessages > 0) {
            needsAttention.push({
                id: 'messages',
                title: `${unreadMessages} Unread Message(s)`,
                description: 'Inquiries from students and instructors.',
                type: 'indigo',
            });
        }
        if (ungradedSubmissions > 0) {
            needsAttention.push({
                id: 'submissions',
                title: `${ungradedSubmissions} Ungraded Submission(s)`,
                description: 'New assignments requiring review.',
                type: 'amber',
            });
        }
        if (needsAttention.length === 0) {
            needsAttention.push({
                id: 'status',
                title: 'System Optimal',
                description: 'No urgent items requiring attention.',
                type: 'emerald',
            });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [curr30, prev30] = await Promise.all([
            Enrollment.countDocuments({ enrolledAt: { $gte: thirtyDaysAgo } }),
            Enrollment.countDocuments({ enrolledAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
        ]);
        const enrollmentGrowth = prev30 === 0 ? 100 : Math.round(((curr30 - prev30) / prev30) * 100);

        const topPerformingCoursesRaw = await Enrollment.aggregate([
            { $group: { _id: '$courseId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: '$course' },
        ]);

        const topPerformingCourses = topPerformingCoursesRaw.map((item: any) => ({
            title: item.course.title,
            enrollments: item.count,
            status: item.count > 100 ? 'Trending' : item.count > 50 ? 'High Yield' : 'Expanding',
            id: item._id.toString(),
        }));

        return NextResponse.json({
            stats: {
                students: studentCount,
                instructors: instructorCount,
                courses: courseCount,
                events: eventCount,
                revenue: totalRevenue,
                completionRate: 87,
                thirtyDayEnrollments: curr30,
                enrollmentGrowth,
                topPerformingCourses,
            },
            recentEnrollments,
            trends: trendsRaw,
            needsAttention,
        });
    } catch (error: any) {
        console.error('GET /api/admin/stats failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
