import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';

const FINANCE_ROLES = ['admin', 'finance'] as const;

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('finance/scholarships route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/finance/scholarships — every student with a sponsor on file (from
// the academy's Flagship Cohort master list, or assigned since via PATCH
// below), joined with their real enrolled course and its real price. A
// sponsored student's "award value" is that course's tuition — there is no
// separate application/approval workflow in this data; a sponsor entry is a
// settled fact, not a pending request.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, FINANCE_ROLES);
        await dbConnect();

        const sponsored = await User.find({ sponsor: { $exists: true, $ne: '' } })
            .select('uid displayName email sponsor')
            .lean<{ uid: string; displayName: string; email: string; sponsor: string }[]>();

        if (sponsored.length === 0) {
            return NextResponse.json({ students: [], sponsors: [] });
        }

        const uids = sponsored.map((s) => s.uid);
        const enrollments = await Enrollment.find({ userId: { $in: uids } })
            .select('userId courseId')
            .lean<{ userId: string; courseId: unknown }[]>();

        const courseIds = [...new Set(enrollments.map((e) => String(e.courseId)))];
        const courses = courseIds.length > 0
            ? await Course.find({ _id: { $in: courseIds } }).select('title price').lean<{ _id: unknown; title: string; price: number }[]>()
            : [];
        const courseById = new Map(courses.map((c) => [String(c._id), c]));

        const enrollmentByUser = new Map<string, { courseId: string }[]>();
        for (const en of enrollments) {
            const list = enrollmentByUser.get(en.userId) || [];
            list.push({ courseId: String(en.courseId) });
            enrollmentByUser.set(en.userId, list);
        }

        const students = sponsored.map((s) => {
            const myEnrollments = enrollmentByUser.get(s.uid) || [];
            const withCourses = myEnrollments.map((e) => courseById.get(e.courseId)).filter(Boolean) as { title: string; price: number }[];
            const totalValue = withCourses.reduce((sum, c) => sum + (c.price || 0), 0);
            return {
                uid: s.uid,
                displayName: s.displayName,
                email: s.email,
                sponsor: s.sponsor,
                courseTitle: withCourses[0]?.title || 'Not yet enrolled',
                value: totalValue,
            };
        });

        const bySponsor = new Map<string, { sponsor: string; studentCount: number; totalValue: number }>();
        for (const s of students) {
            const existing = bySponsor.get(s.sponsor) || { sponsor: s.sponsor, studentCount: 0, totalValue: 0 };
            existing.studentCount += 1;
            existing.totalValue += s.value;
            bySponsor.set(s.sponsor, existing);
        }

        return NextResponse.json({
            students: students.sort((a, b) => a.sponsor.localeCompare(b.sponsor) || a.displayName.localeCompare(b.displayName)),
            sponsors: [...bySponsor.values()].sort((a, b) => b.studentCount - a.studentCount),
        });
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// PATCH /api/finance/scholarships — assign or change a student's sponsor.
// Pass sponsor: "" (empty string) to remove sponsorship.
// =============================================================================
const patchSchema = z.object({
    uid: z.string().min(1),
    sponsor: z.string().max(200),
});

export const PATCH = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, FINANCE_ROLES);

        const json = await req.json().catch(() => null);
        const parsed = patchSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
        }
        const { uid, sponsor } = parsed.data;

        await dbConnect();
        const existing = await User.findOne({ uid }).select('role');
        if (!existing || existing.role !== 'student') {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const update = sponsor ? { $set: { sponsor } } : { $unset: { sponsor: '' } };
        await User.updateOne({ uid }, update);

        return NextResponse.json({ uid, sponsor: sponsor || null });
    } catch (err) {
        return handleError(err);
    }
});
