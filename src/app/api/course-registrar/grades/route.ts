import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import User from '@/models/User';
import { requireRole, withAuth } from '@/lib/auth-server';

// =============================================================================
// GET /api/course-registrar/grades — every graded or submitted test/exam
// attempt platform-wide, joined with the student, the assessment, and (when
// the assessment targets one course rather than the whole cohort) the course
// title. Real data — replaces the old hardcoded mock grade table.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['course_registrar', 'admin']);
        await dbConnect();

        const attempts = await Attempt.find({ status: { $in: ['submitted', 'graded'] } })
            .sort({ submittedAt: -1 })
            .limit(200)
            .lean<{ _id: unknown; assessmentId: unknown; userId: string; score: number; maxScore: number; status: string; submittedAt?: Date }[]>();

        if (attempts.length === 0) {
            return NextResponse.json([]);
        }

        const assessmentIds = [...new Set(attempts.map((a) => String(a.assessmentId)))];
        const userIds = [...new Set(attempts.map((a) => a.userId))];

        const [assessments, users] = await Promise.all([
            Assessment.find({ _id: { $in: assessmentIds } }).select('title courseId').lean<{ _id: unknown; title: string; courseId?: unknown }[]>(),
            User.find({ uid: { $in: userIds } }).select('uid displayName email').lean<{ uid: string; displayName: string; email: string }[]>(),
        ]);

        const courseIds = [...new Set(assessments.map((a) => a.courseId).filter(Boolean).map(String))];
        const courses = courseIds.length > 0
            ? await Course.find({ _id: { $in: courseIds } }).select('title').lean<{ _id: unknown; title: string }[]>()
            : [];

        const assessmentById = new Map(assessments.map((a) => [String(a._id), a]));
        const courseById = new Map(courses.map((c) => [String(c._id), c]));
        const userById = new Map(users.map((u) => [u.uid, u]));

        const result = attempts.map((attempt) => {
            const assessment = assessmentById.get(String(attempt.assessmentId));
            const course = assessment?.courseId ? courseById.get(String(assessment.courseId)) : null;
            const student = userById.get(attempt.userId);
            const percentage = attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;
            return {
                id: String(attempt._id),
                studentUid: attempt.userId,
                studentName: student?.displayName || 'Unknown Student',
                studentEmail: student?.email || '',
                assessmentTitle: assessment?.title || 'Untitled Assessment',
                courseTitle: course?.title || 'Whole Cohort',
                score: attempt.score,
                maxScore: attempt.maxScore,
                percentage,
                status: attempt.status,
                submittedAt: attempt.submittedAt,
            };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('GET /api/course-registrar/grades failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
