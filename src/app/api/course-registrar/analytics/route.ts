import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { requireRole, withAuth } from '@/lib/auth-server';

// =============================================================================
// GET /api/course-registrar/analytics — real 7-day enrollment trend and real
// category mix, both derived from actual Enrollment/Course documents.
// Replaces the old page's `setTimeout`-mocked fake dataset.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['course_registrar', 'admin']);
        await dbConnect();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [enrollmentsLast7, allEnrollments, allCourses, thirtyDayCount] = await Promise.all([
            Enrollment.find({ enrolledAt: { $gte: sevenDaysAgo } }).select('enrolledAt').lean<{ enrolledAt: Date }[]>(),
            Enrollment.find({}).select('courseId progress').lean<{ courseId: unknown; progress: number }[]>(),
            Course.find({}).select('category').lean<{ _id: unknown; category?: string }[]>(),
            Enrollment.countDocuments({ enrolledAt: { $gte: thirtyDaysAgo } }),
        ]);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trendByDay = new Map<string, number>();
        for (const en of enrollmentsLast7) {
            const key = new Date(en.enrolledAt).toISOString().slice(0, 10);
            trendByDay.set(key, (trendByDay.get(key) || 0) + 1);
        }
        const enrollmentTrends: { name: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            enrollmentTrends.push({ name: dayNames[d.getDay()], count: trendByDay.get(key) || 0 });
        }

        const categoryByCourseId = new Map(allCourses.map((c) => [String(c._id), c.category || 'Uncategorized']));
        const countByCategory = new Map<string, number>();
        for (const en of allEnrollments) {
            const category = categoryByCourseId.get(String(en.courseId)) || 'Uncategorized';
            countByCategory.set(category, (countByCategory.get(category) || 0) + 1);
        }
        const categoryDistribution = [...countByCategory.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));

        const completedCount = allEnrollments.filter((en) => (en.progress || 0) >= 100).length;
        const completionRate = allEnrollments.length === 0 ? 0 : Math.round((completedCount / allEnrollments.length) * 100);

        return NextResponse.json({
            enrollmentTrends,
            categoryDistribution,
            stats: {
                totalEnrollments: allEnrollments.length,
                totalCourses: allCourses.length,
                completionRate,
                thirtyDayEnrollments: thirtyDayCount,
            },
        });
    } catch (error: any) {
        console.error('GET /api/course-registrar/analytics failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
