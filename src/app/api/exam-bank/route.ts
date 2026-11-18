import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('exam-bank route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/exam-bank — every exam and test, drafts included, WITH the answer
// key, grouped by course. Read-only, for the admin, registrar, admissions and
// Academic Affairs. Students never reach this (drafts are hidden from them).
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['admin', 'registrar', 'admissions_officer', 'course_registrar']);
        await dbConnect();

        const [assessments, courses] = await Promise.all([
            Assessment.find({})
                .select('title slug type status courseId durationMinutes totalPoints opensAt closesAt questions')
                .sort({ title: 1 })
                .lean<any[]>(),
            Course.find({}).select('title').lean<any[]>(),
        ]);
        const courseTitle = new Map(courses.map(c => [String(c._id), c.title as string]));

        const exams = assessments.map(a => ({
            id: String(a._id),
            slug: a.slug || String(a._id),
            title: a.title,
            type: a.type,
            status: a.status,
            courseTitle: a.courseId ? courseTitle.get(String(a.courseId)) || 'Unknown course' : 'All students',
            durationMinutes: a.durationMinutes,
            totalPoints: a.totalPoints,
            opensAt: a.opensAt,
            closesAt: a.closesAt,
            questions: (a.questions || [])
                .slice()
                .sort((x: any, y: any) => (x.order ?? 0) - (y.order ?? 0))
                .map((q: any) => ({
                    text: q.text,
                    points: q.points,
                    options: (q.options || []).map((o: any) => ({ text: o.text, isCorrect: !!o.isCorrect })),
                })),
        }));

        return NextResponse.json({ exams });
    } catch (err) {
        return handleError(err);
    }
});
