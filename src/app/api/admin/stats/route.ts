import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Event from '@/models/Event';
import Enrollment from '@/models/Enrollment';
import { Message, Submission } from '@/models/Supports';

export async function GET() {
    try {
        await dbConnect();

        // 1. Basic Stats
        const [studentCount, instructorCount, courseCount, eventCount, unreadMessages, ungradedSubmissions] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'instructor' }),
            Course.countDocuments({}),
            Event.countDocuments({}),
            Message.countDocuments({ isRead: false }),
            Submission.countDocuments({ grade: { $exists: false } })
        ]);

        // 2. Recent Enrollments (with basic course info)
        const recentEnrollmentsRaw = await Enrollment.find({})
            .sort({ enrolledAt: -1 })
            .limit(5);

        // Fetch course info and user info for these enrollments
        const courseIds = recentEnrollmentsRaw.map(en => en.courseId);
        const uids = recentEnrollmentsRaw.map(en => en.userId);

        const [courses, users] = await Promise.all([
            Course.find({ _id: { $in: courseIds } }),
            User.find({ uid: { $in: uids } })
        ]);

        const courseMap = Object.fromEntries(courses.map(c => [c._id.toString(), c]));
        const userMap = Object.fromEntries(users.map(u => [u.uid, u]));

        console.log(`DEBUG: Found ${users.length} users for ${uids.length} uids`);
        console.log(`DEBUG: UIDs requested: ${JSON.stringify(uids)}`);
        console.log(`DEBUG: UIDs found: ${JSON.stringify(users.map(u => u.uid))}`);

        const recentEnrollments = recentEnrollmentsRaw.map(en => {
            const user = userMap[en.userId];
            if (!user) {
                console.log(`DEBUG: Mismatch for Enrollment ${en._id}: UserID ${en.userId} not found in userMap`);
            }
            return {
                id: en._id.toString(),
                userId: en.userId,
                userName: user?.displayName || 'Unknown Student',
                userPhoto: user?.photoURL,
                course: courseMap[en.courseId.toString()] || { title: 'Unknown Course' },
                enrolledAt: en.enrolledAt,
                progress: en.progress
            };
        });

        // 3. Trends (Last 7 days enrollment and revenue)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendsRaw = await Enrollment.aggregate([
            { $match: { enrolledAt: { $gte: sevenDaysAgo } } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
                    enrollments: { $sum: 1 },
                    revenue: { $sum: { $ifNull: ['$course.price', 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 4. Revenue & Growth (Calculated from Course prices * Enrollments)
        const allEnrollments = await Enrollment.find({});
        const allCourses = await Course.find({});
        const priceMap = Object.fromEntries(allCourses.map(c => [c._id.toString(), c.price || 0]));

        const totalRevenue = allEnrollments.reduce((sum, en) => {
            return sum + (priceMap[en.courseId.toString()] || 0);
        }, 0);

        // 5. Needs Attention (Dynamic items)
        const needsAttention = [];
        if (unreadMessages > 0) {
            needsAttention.push({
                id: 'messages',
                title: `${unreadMessages} Unread Message(s)`,
                description: 'Inquiries from students and instructors.',
                type: 'indigo'
            });
        }
        if (ungradedSubmissions > 0) {
            needsAttention.push({
                id: 'submissions',
                title: `${ungradedSubmissions} Ungraded Submission(s)`,
                description: 'New assignments requiring review.',
                type: 'amber'
            });
        }
        if (needsAttention.length === 0) {
            needsAttention.push({
                id: 'status',
                title: 'System Optimal',
                description: 'No urgent items requiring attention.',
                type: 'emerald'
            });
        }

        // 6. 30-Day Enrollment Total & Growth
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [curr30, prev30] = await Promise.all([
            Enrollment.countDocuments({ enrolledAt: { $gte: thirtyDaysAgo } }),
            Enrollment.countDocuments({ enrolledAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
        ]);

        const enrollmentGrowth = prev30 === 0 ? 100 : Math.round(((curr30 - prev30) / prev30) * 100);

        // 7. Top Performing Courses (Aggregation)
        const topPerformingCoursesRaw = await Enrollment.aggregate([
            {
                $group: {
                    _id: '$courseId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' }
        ]);

        const topPerformingCourses = topPerformingCoursesRaw.map(item => ({
            title: item.course.title,
            enrollments: item.count,
            status: item.count > 100 ? "Trending" : item.count > 50 ? "High Yield" : "Expanding",
            id: item._id.toString()
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
                enrollmentGrowth: enrollmentGrowth,
                topPerformingCourses
            },
            recentEnrollments,
            trends: trendsRaw,
            needsAttention
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
