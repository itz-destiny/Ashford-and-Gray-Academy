import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attempt from '@/models/Attempt';
import Assessment from '@/models/Assessment';
import { withAuth } from '@/lib/auth-server';

// =============================================================================
// GET /api/attempts/mine — every test/exam attempt the calling student has
// made, with the assessment's title/type joined in. This is the real,
// automatically-scored counterpart to the old assignment-based grade table —
// MCQ/true-false attempts already carry a real score the moment they're
// submitted (see PATCH /api/attempts/[id]); short-answer questions show as
// pending until an instructor grades them.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        await dbConnect();

        const attempts = await Attempt.find({ userId: auth.uid, status: { $in: ['submitted', 'graded'] } })
            .sort({ submittedAt: -1 })
            .lean();

        const assessmentIds = Array.from(new Set(attempts.map((a: any) => String(a.assessmentId))));
        const assessments = assessmentIds.length
            ? await Assessment.find({ _id: { $in: assessmentIds } }).select('title type').lean()
            : [];
        const assessmentById = new Map(assessments.map((a: any) => [String(a._id), a]));

        const results = attempts.map((a: any) => {
            const assessment = assessmentById.get(String(a.assessmentId));
            const hasPendingGrading = (a.answers || []).some((ans: any) => ans.pointsAwarded === null || ans.pointsAwarded === undefined);
            return {
                _id: a._id,
                assessmentId: a.assessmentId,
                title: assessment?.title || 'Untitled Assessment',
                type: assessment?.type || 'test',
                score: a.score,
                maxScore: a.maxScore,
                percentage: a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : null,
                status: hasPendingGrading ? 'pending' : 'graded',
                submittedAt: a.submittedAt,
                gradedAt: a.gradedAt,
            };
        });

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('GET /api/attempts/mine failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
