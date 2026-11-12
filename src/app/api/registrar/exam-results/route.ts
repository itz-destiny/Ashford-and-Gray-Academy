import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { buildExamResults } from '@/lib/exam-results';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('registrar/exam-results route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/registrar/exam-results — every published test and exam, grouped by
// course, with each enrolled student's result: who took it, their score, and
// who hasn't taken it yet. Registrar, admin and course registrar only.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['registrar', 'admin', 'course_registrar']);
        await dbConnect();

        const list = await buildExamResults();
        return NextResponse.json({ courses: list });
    } catch (err) {
        return handleError(err);
    }
});
