import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Transaction from '@/models/Transaction';
import LiveClass from '@/models/LiveClass';
import Assessment from '@/models/Assessment';
import Attempt from '@/models/Attempt';
import { withAuth, requireRole } from '@/lib/auth-server';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// =============================================================================
// GET /api/instructor/performance — every number and chart series on the
// instructor Performance page, computed from real data: no placeholders,
// no hardcoded percentages.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['instructor', 'admin']);
        await dbConnect();

        const courses = await Course.find({ instructorUid: auth.uid }).select('_id title price').lean();
        const courseIds = courses.map((c: any) => c._id.toString());

        if (courseIds.length === 0) {
            return NextResponse.json({
                success: true,
                kpis: { courseCompletion: null, studentEngagement: null, averageScore: null, totalRevenue: 0 },
                enrollmentTrend: [],
                attendanceByClass: [],
                scoreDistribution: [],
                courseBreakdown: [],
            });
        }

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).select('courseId enrolledAt progress').lean();

        // ---- Course completion: % of enrollments at 100% progress ----
        const courseCompletion = enrollments.length > 0
            ? Math.round((enrollments.filter((e: any) => (e.progress || 0) >= 100).length / enrollments.length) * 100)
            : null;

        // ---- Enrollment trend: real signups per week, last 10 weeks ----
        const now = Date.now();
        const weeks = Array.from({ length: 10 }, (_, i) => {
            const start = now - (9 - i) * WEEK_MS;
            return { start, end: start + WEEK_MS, label: `Wk ${i + 1}` };
        });
        const enrollmentTrend = weeks.map((w) => ({
            week: w.label,
            enrollments: enrollments.filter((e: any) => {
                const t = new Date(e.enrolledAt).getTime();
                return t >= w.start && t < w.end;
            }).length,
        }));

        // ---- Attendance by live class ("Engagement Flux") ----
        const liveClasses = await LiveClass.find({ courseId: { $in: courseIds } }).sort({ startTime: 1 }).lean();
        const enrollmentCountByCourse = new Map<string, number>();
        for (const e of enrollments) {
            const key = String(e.courseId);
            enrollmentCountByCourse.set(key, (enrollmentCountByCourse.get(key) || 0) + 1);
        }
        const pastClasses = liveClasses.filter((c: any) => {
            const endTime = new Date(c.startTime).getTime() + (c.durationMinutes || 60) * 60000;
            return endTime < now && c.status !== 'cancelled';
        });
        const attendanceByClass = pastClasses.slice(-12).map((c: any) => {
            const enrolled = enrollmentCountByCourse.get(String(c.courseId)) || 0;
            const attended = (c.attendees || []).length;
            return {
                topic: c.topic?.length > 24 ? `${c.topic.slice(0, 24)}…` : c.topic,
                date: new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                attendanceRate: enrolled > 0 ? Math.round((attended / enrolled) * 100) : 0,
            };
        });
        const studentEngagement = attendanceByClass.length > 0
            ? Math.round(attendanceByClass.reduce((sum, c) => sum + c.attendanceRate, 0) / attendanceByClass.length)
            : null;

        // ---- Test/exam performance ----
        const assessments = await Assessment.find({ createdBy: auth.uid }).select('_id').lean();
        const assessmentIds = assessments.map((a: any) => a._id);
        const attempts = assessmentIds.length > 0
            ? await Attempt.find({ assessmentId: { $in: assessmentIds }, status: { $in: ['submitted', 'graded'] } }).select('score maxScore').lean()
            : [];
        const gradedAttempts = attempts.filter((a: any) => a.maxScore > 0);
        const averageScore = gradedAttempts.length > 0
            ? Math.round(gradedAttempts.reduce((sum, a: any) => sum + (a.score / a.maxScore) * 100, 0) / gradedAttempts.length)
            : null;

        const buckets = [
            { range: '0-49%', min: 0, max: 49 },
            { range: '50-69%', min: 50, max: 69 },
            { range: '70-84%', min: 70, max: 84 },
            { range: '85-100%', min: 85, max: 100 },
        ];
        const scoreDistribution = buckets.map((b) => ({
            range: b.range,
            count: gradedAttempts.filter((a: any) => {
                const pct = (a.score / a.maxScore) * 100;
                return pct >= b.min && pct <= b.max;
            }).length,
        }));

        // ---- Revenue: real completed enrollment transactions ----
        const revenueAgg = await Transaction.aggregate([
            { $match: { instructorId: auth.uid, type: 'enrollment', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        // ---- Per-course breakdown ----
        const courseBreakdown = courses.map((c: any) => {
            const cid = c._id.toString();
            const courseEnrollments = enrollments.filter((e: any) => String(e.courseId) === cid);
            const completed = courseEnrollments.filter((e: any) => (e.progress || 0) >= 100).length;
            return {
                title: c.title?.length > 20 ? `${c.title.slice(0, 20)}…` : c.title,
                enrolled: courseEnrollments.length,
                completed,
            };
        });

        return NextResponse.json({
            success: true,
            kpis: { courseCompletion, studentEngagement, averageScore, totalRevenue },
            enrollmentTrend,
            attendanceByClass,
            scoreDistribution,
            courseBreakdown,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error.status || 500 });
    }
});
