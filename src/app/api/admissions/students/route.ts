import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import { AuthError, requireRole, withAuth } from '@/lib/auth-server';
import { adminAuth } from '@/lib/firebase-admin';
import { resolveCourse, resolveCourses } from '@/lib/resolve-course';
import { generateTempPassword } from '@/lib/generate-password';
import { sendEmail, emailTemplates } from '@/lib/email';
import { getEmailUrl } from '@/lib/app-url';
import { rateLimit } from '@/lib/rate-limit';

const ADMISSIONS_ROLES = ['admin', 'registrar', 'admissions_officer'] as const;

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

function handleError(err: unknown): Response {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('admissions/students route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// =============================================================================
// GET /api/admissions/students — every student, joined with their current
// enrollment(s) and course title(s). Powers the admissions roster.
// =============================================================================
export const GET = withAuth(async (_req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ADMISSIONS_ROLES);
        await dbConnect();

        const [students, enrollments] = await Promise.all([
            User.find({ role: 'student' })
                .select('uid displayName email phone')
                .lean<{ uid: string; displayName: string; email: string; phone?: string }[]>(),
            Enrollment.find({}).lean<{ _id: unknown; userId: string; courseId: unknown }[]>(),
        ]);

        const courseMap = await resolveCourses(
            enrollments.map(e => e.courseId?.toString()).filter(Boolean) as string[]
        );

        const enrollmentsByUser = new Map<string, typeof enrollments>();
        for (const en of enrollments) {
            const list = enrollmentsByUser.get(en.userId) || [];
            list.push(en);
            enrollmentsByUser.set(en.userId, list);
        }

        const result = students.map(s => {
            const ens = enrollmentsByUser.get(s.uid) || [];
            return {
                uid: s.uid,
                displayName: s.displayName,
                email: s.email,
                phone: s.phone,
                enrollments: ens.map(en => {
                    const cid = en.courseId?.toString();
                    const course = cid ? courseMap.get(cid) : null;
                    return {
                        enrollmentId: String(en._id),
                        courseId: cid,
                        courseTitle: course?.title || 'Unknown course',
                    };
                }),
            };
        });

        return NextResponse.json(result);
    } catch (err) {
        return handleError(err);
    }
});

// =============================================================================
// POST /api/admissions/students — admit a brand-new student: creates the
// Firebase account, the Mongo profile, an enrollment in the chosen course, and
// emails their login credentials. Productionized version of the manual
// registration pattern used throughout this cohort's onboarding.
// =============================================================================
const createSchema = z.object({
    displayName: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional(),
    country: z.string().max(120).optional(),
    courseId: z.string().min(1),
});

export const POST = withAuth(async (req: NextRequest, { auth }) => {
    try {
        requireRole(auth, ADMISSIONS_ROLES);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
        try {
            await limiter.check(null, 20, ip);
        } catch {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const json = await req.json().catch(() => null);
        const parsed = createSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const { displayName, email, phone, country, courseId } = parsed.data;

        await dbConnect();

        const course = await resolveCourse(courseId);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 });
        }

        const password = generateTempPassword(displayName);
        const auth_ = adminAuth();

        let fbUid: string;
        try {
            const fbUser = await auth_.createUser({ email, password, displayName, emailVerified: true });
            fbUid = fbUser.uid;
        } catch (err: any) {
            if (err?.errorInfo?.code === 'auth/email-already-exists') {
                const fbUser = await auth_.getUserByEmail(email);
                await auth_.updateUser(fbUser.uid, { password });
                fbUid = fbUser.uid;
            } else {
                throw err;
            }
        }

        const student = await User.create({
            uid: fbUid,
            email,
            displayName,
            role: 'student',
            phone,
            country,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            mustChangePassword: true,
        });

        const enrollment = await Enrollment.create({ userId: fbUid, courseId });

        try {
            const appUrl = getEmailUrl();
            const tpl = emailTemplates.enrollmentWelcome({
                recipientName: displayName,
                email,
                password,
                loginUrl: `${appUrl}/login`,
                courseName: course.title,
            });
            void sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
        } catch (mailErr) {
            console.warn('enrollmentWelcome email skipped:', mailErr);
        }

        return NextResponse.json({ student, enrollment }, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
});
