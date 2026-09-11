import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import LiveClass from '@/models/LiveClass';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { resolveCourse } from '@/lib/resolve-course';
import { rateLimit } from '@/lib/rate-limit';

type RouteParams = { params: Promise<{ id: string }> };

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

// =============================================================================
// GET /api/live-classes/[id]/attendance/public — class info for the public,
// no-login attendance sign-in page. No auth required; reveals nothing
// sensitive (same fields the logged-in check-in page already shows).
// =============================================================================
export const GET = async (_req: NextRequest, { params }: RouteParams) => {
    try {
        await dbConnect();
        const { id } = await params;
        const liveClass = await LiveClass.findById(id).lean<{ topic: string; courseId: string; startTime: Date } | null>();
        if (!liveClass) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

        const course = await resolveCourse(liveClass.courseId);
        return NextResponse.json({
            topic: liveClass.topic,
            courseTitle: course?.title || 'Whole Cohort',
            startTime: liveClass.startTime,
        });
    } catch (err: any) {
        console.error('GET /api/live-classes/[id]/attendance/public failed:', err);
        return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
    }
};

const bodySchema = z.object({ email: z.string().email() });

// =============================================================================
// POST /api/live-classes/[id]/attendance/public — a student signs their own
// attendance with just the email their account uses, no sign-in required.
// Only ever writes an attendee row for a real, existing account — never
// creates one — and only if that account is actually enrolled in the
// class's course (or the class is cohort-wide, like orientation).
// =============================================================================
export const POST = async (req: NextRequest, { params }: RouteParams) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    try {
        await limiter.check(null, 20, ip);
    } catch {
        return NextResponse.json({ error: 'Too many attempts. Please wait a moment and try again.' }, { status: 429 });
    }

    try {
        await dbConnect();
        const { id } = await params;

        const json = await req.json().catch(() => null);
        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }
        const email = parsed.data.email.trim();

        const liveClass = await LiveClass.findById(id);
        if (!liveClass) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

        const student = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
        if (!student) {
            return NextResponse.json({ error: "We couldn't find an account with that email." }, { status: 404 });
        }

        if (student.role === 'student') {
            const enrolled = await Enrollment.findOne({ userId: student.uid, courseId: liveClass.courseId }).select('_id').lean();
            if (!enrolled) {
                return NextResponse.json({ error: "That email isn't enrolled in this class's course." }, { status: 403 });
            }
        }

        const existing = (liveClass.attendees || []).find((a: any) => a.userId === student.uid);
        if (!existing) {
            liveClass.attendees = liveClass.attendees || [];
            (liveClass.attendees as any).push({ userId: student.uid, email: student.email, role: student.role, joinedAt: new Date() });
            await liveClass.save();
        }

        return NextResponse.json({ success: true, name: student.displayName });
    } catch (err: any) {
        console.error('POST /api/live-classes/[id]/attendance/public failed:', err);
        return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
    }
};
