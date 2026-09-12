import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FacilitatorFeedback from '@/models/FacilitatorFeedback';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

const RATING_5 = ['excellent', 'good', 'average', 'poor', 'very_poor'];
const FREQUENCY_5 = ['always', 'often', 'sometimes', 'rarely', 'never'];
const ENGAGEMENT_5 = ['very_engaging', 'engaging', 'average', 'not_very_engaging', 'not_engaging_at_all'];

// Every scale is framed best-to-worst, so a shared 5..1 mapping by index
// works for all three answer sets.
function scoreOf(scale: string[], value: string): number {
    const i = scale.indexOf(value);
    return i === -1 ? 0 : 5 - i;
}

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('registrar/feedback route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/registrar/feedback — every facilitator-feedback submission,
// grouped by facilitator, with average scores per question and the full
// list of written comments. Registrar/admin only.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['registrar', 'admin']);
        await dbConnect();

        const all = await FacilitatorFeedback.find({}).sort({ createdAt: -1 }).lean<any[]>();

        const byFacilitator = new Map<string, any>();
        for (const f of all) {
            const key = f.instructorUid || f.instructorName || 'unassigned';
            if (!byFacilitator.has(key)) {
                byFacilitator.set(key, {
                    instructorUid: f.instructorUid || null,
                    instructorName: f.instructorName || 'Unassigned',
                    courseTitles: new Set<string>(),
                    responseCount: 0,
                    totals: { overallRating: 0, clarity: 0, approachable: 0, timeManagement: 0, engagement: 0 },
                    comments: [] as any[],
                });
            }
            const bucket = byFacilitator.get(key);
            bucket.courseTitles.add(f.courseTitle);
            bucket.responseCount += 1;
            bucket.totals.overallRating += scoreOf(RATING_5, f.overallRating);
            bucket.totals.clarity += scoreOf(FREQUENCY_5, f.clarity);
            bucket.totals.approachable += scoreOf(FREQUENCY_5, f.approachable);
            bucket.totals.timeManagement += scoreOf(RATING_5, f.timeManagement);
            bucket.totals.engagement += scoreOf(ENGAGEMENT_5, f.engagement);
            if (f.likedMost || f.improvement || f.otherComments) {
                bucket.comments.push({
                    courseTitle: f.courseTitle,
                    likedMost: f.likedMost,
                    improvement: f.improvement,
                    otherComments: f.otherComments,
                    submittedAt: f.createdAt,
                });
            }
        }

        const facilitators = Array.from(byFacilitator.values()).map((b) => {
            const n = b.responseCount;
            const avg = {
                overallRating: b.totals.overallRating / n,
                clarity: b.totals.clarity / n,
                approachable: b.totals.approachable / n,
                timeManagement: b.totals.timeManagement / n,
                engagement: b.totals.engagement / n,
            };
            const avgScore = (avg.overallRating + avg.clarity + avg.approachable + avg.timeManagement + avg.engagement) / 5;
            return {
                instructorUid: b.instructorUid,
                instructorName: b.instructorName,
                courseTitles: Array.from(b.courseTitles),
                responseCount: n,
                avg,
                avgScore,
                comments: b.comments,
            };
        }).sort((a, b) => b.responseCount - a.responseCount);

        return NextResponse.json({ success: true, totalResponses: all.length, facilitators });
    } catch (err) {
        return handleError(err);
    }
});
