import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import { requireRole, withAuth } from '@/lib/auth-server';

// =============================================================================
// GET /api/course-registrar/students — every student, joined with their real
// enrollment count and real average progress across those enrollments.
// Replaces the old client-side `Math.random()` mock stats on the Course
// Registrar Students page.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ['course_registrar', 'admin']);
        await dbConnect();

        const [students, enrollments] = await Promise.all([
            User.find({ role: 'student' })
                .select('uid displayName email photoURL')
                .lean<{ uid: string; displayName: string; email: string; photoURL?: string }[]>(),
            Enrollment.find({}).select('userId progress').lean<{ userId: string; progress: number }[]>(),
        ]);

        const byUser = new Map<string, number[]>();
        for (const en of enrollments) {
            const list = byUser.get(en.userId) || [];
            list.push(en.progress || 0);
            byUser.set(en.userId, list);
        }

        const result = students.map((s) => {
            const progresses = byUser.get(s.uid) || [];
            const avgProgress = progresses.length > 0
                ? Math.round(progresses.reduce((sum, p) => sum + p, 0) / progresses.length)
                : 0;
            return {
                uid: s.uid,
                displayName: s.displayName,
                email: s.email,
                photoURL: s.photoURL,
                enrollmentCount: progresses.length,
                avgProgress,
            };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('GET /api/course-registrar/students failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});
