import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import FacilitatorFeedback from '@/models/FacilitatorFeedback';
import { resolveCourses } from '@/lib/resolve-course';
import { getPrimaryFacilitator } from '@/lib/course-facilitator';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =============================================================================
// GET /api/feedback/public?email=... — a real, no-login-required student
// looks up which of their courses (and facilitators) they can leave feedback
// for, and whether they've already submitted one for each.
// =============================================================================
export async function GET(req: NextRequest): Promise<Response> {
    try {
        await dbConnect();
        const email = req.nextUrl.searchParams.get('email')?.trim();
        if (!email) {
            return NextResponse.json({ error: 'Enter your email address.' }, { status: 400 });
        }

        const student = await User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });
        if (!student) {
            return NextResponse.json({ error: "We couldn't find an account with that email." }, { status: 404 });
        }

        const enrollments = await Enrollment.find({ userId: student.uid }).select('courseId').lean<{ courseId: any }[]>();
        if (enrollments.length === 0) {
            return NextResponse.json({ error: "This account isn't enrolled in any course yet." }, { status: 404 });
        }

        const courseIds = enrollments.map((e) => String(e.courseId));
        const courses = await resolveCourses(courseIds);
        const submitted = await FacilitatorFeedback.find({ studentUid: student.uid, courseId: { $in: courseIds } })
            .select('courseId').lean<{ courseId: string }[]>();
        const submittedSet = new Set(submitted.map((s) => s.courseId));

        const options = await Promise.all(courseIds.map(async (cid) => {
            const course = courses.get(cid);
            const facilitator = await getPrimaryFacilitator(cid);
            return {
                courseId: cid,
                courseTitle: course?.title || 'Your Course',
                facilitatorName: facilitator?.name || 'Your Facilitator',
                alreadySubmitted: submittedSet.has(cid),
            };
        }));

        return NextResponse.json({ success: true, studentName: student.displayName, courses: options });
    } catch (err: any) {
        console.error('GET /api/feedback/public failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

const RATING_5 = ['excellent', 'good', 'average', 'poor', 'very_poor'] as const;
const FREQUENCY_5 = ['always', 'often', 'sometimes', 'rarely', 'never'] as const;
const ENGAGEMENT_5 = ['very_engaging', 'engaging', 'average', 'not_very_engaging', 'not_engaging_at_all'] as const;

const bodySchema = z.object({
    email: z.string().email(),
    courseId: z.string().min(1),
    overallRating: z.enum(RATING_5),
    clarity: z.enum(FREQUENCY_5),
    approachable: z.enum(FREQUENCY_5),
    timeManagement: z.enum(RATING_5),
    engagement: z.enum(ENGAGEMENT_5),
    likedMost: z.string().max(2000).optional(),
    improvement: z.string().max(2000).optional(),
    otherComments: z.string().max(2000).optional(),
});

// =============================================================================
// POST /api/feedback/public — records one facilitator-feedback submission.
// No sign-in required, but the email must belong to a real account enrolled
// in the course being reviewed.
// =============================================================================
export async function POST(req: NextRequest): Promise<Response> {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    try {
        await limiter.check(null, 10, ip);
    } catch {
        return NextResponse.json({ error: 'Too many attempts. Please wait a moment and try again.' }, { status: 429 });
    }

    try {
        await dbConnect();
        const json = await req.json().catch(() => null);
        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Please complete all the required questions.' }, { status: 400 });
        }
        const data = parsed.data;

        const student = await User.findOne({ email: new RegExp(`^${escapeRegex(data.email.trim())}$`, 'i') });
        if (!student) {
            return NextResponse.json({ error: "We couldn't find an account with that email." }, { status: 404 });
        }

        const enrolled = await Enrollment.findOne({ userId: student.uid, courseId: data.courseId }).select('_id').lean();
        if (!enrolled) {
            return NextResponse.json({ error: "That email isn't enrolled in this course." }, { status: 403 });
        }

        const course = (await resolveCourses([data.courseId])).get(data.courseId);
        const facilitator = await getPrimaryFacilitator(data.courseId);

        await FacilitatorFeedback.create({
            courseId: data.courseId,
            courseTitle: course?.title || 'Unknown course',
            instructorUid: facilitator?.uid,
            instructorName: facilitator?.name,
            studentUid: student.uid,
            studentEmail: student.email,
            overallRating: data.overallRating,
            clarity: data.clarity,
            approachable: data.approachable,
            timeManagement: data.timeManagement,
            engagement: data.engagement,
            likedMost: data.likedMost,
            improvement: data.improvement,
            otherComments: data.otherComments,
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('POST /api/feedback/public failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
